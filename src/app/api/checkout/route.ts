import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { holdSlot, releaseHold } from '@/lib/bookings';
import { computeDeposit } from '@/lib/money';
import { planDepositSplit } from '@/lib/credits';

export const runtime = 'nodejs';

/**
 * POST /api/checkout
 * body: { slot_id }
 * - Verifies user, holds slot.
 * - If studio credit covers the full deposit → { credit_only: true }; client completes via /api/booking/confirm-credit.
 * - Else → Stripe Checkout for the card portion (Stripe must be configured).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to book.' }, { status: 401 });
  }

  let body: { slot_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }
  const slotId = body.slot_id;
  if (!slotId) return NextResponse.json({ error: 'slot_id required' }, { status: 400 });

  const admin = createAdminClient();
  const { data: slot } = await admin
    .from('available_slots')
    .select(`
      id,
      starts_at,
      duration_minutes,
      price_cents,
      status,
      private_for_user,
      session_types (id, name, deposit_pct)
    `)
    .eq('id', slotId)
    .single();
  if (!slot || !slot.session_types) {
    return NextResponse.json({ error: 'Slot not found.' }, { status: 404 });
  }
  if (slot.status !== 'open') {
    return NextResponse.json({ error: 'Slot no longer available.' }, { status: 409 });
  }
  if (slot.private_for_user && slot.private_for_user !== user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const acquired = await holdSlot(slotId, user.id);
  if (!acquired) {
    return NextResponse.json({ error: 'Slot just claimed by someone else.' }, { status: 409 });
  }

  const depositCents = computeDeposit(slot.price_cents, Number(slot.session_types.deposit_pct));

  const { data: balRow } = await supabase
    .from('credit_balances')
    .select('balance_cents')
    .eq('customer_id', user.id)
    .maybeSingle();
  const balanceCents = balRow?.balance_cents ?? 0;

  let split: { creditAppliedCents: number; stripeChargeCents: number };
  try {
    split = planDepositSplit(depositCents, balanceCents);
  } catch (e) {
    await releaseHold(slotId, user.id);
    if (e instanceof Error && e.message === 'STRIPE_MINIMUM_BLOCKED') {
      return NextResponse.json(
        {
          error:
            'This deposit mix of card and credit cannot be processed automatically. Please contact the studio.',
        },
        { status: 400 },
      );
    }
    throw e;
  }

  if (split.stripeChargeCents === 0) {
    return NextResponse.json({
      credit_only: true as const,
      deposit_cents: depositCents,
      credit_applied_cents: split.creditAppliedCents,
    });
  }

  if (!env.hasStripe()) {
    await releaseHold(slotId, user.id);
    return NextResponse.json(
      { error: 'Card payment requires Stripe keys. Until they are configured, studio credit cannot cover only part of the deposit.' },
      { status: 503 },
    );
  }

  const creditApplied = split.creditAppliedCents;
  const descParts = [`Session ${new Date(slot.starts_at).toLocaleString('en-US')}`];
  if (creditApplied > 0) {
    descParts.unshift(`${(creditApplied / 100).toFixed(2)} USD from studio credit`);
  }

  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${slot.session_types.name} — deposit`,
              description: descParts.join(' · '),
            },
            unit_amount: split.stripeChargeCents,
          },
        },
      ],
      metadata: {
        slot_id: slot.id,
        customer_id: user.id,
        amount_cents: String(slot.price_cents),
        deposit_cents: String(depositCents),
        credit_applied_cents: String(creditApplied),
        stripe_charged_cents: String(split.stripeChargeCents),
      },
      success_url: `${env.siteUrl()}/account/bookings?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl()}/book/${slot.id}?status=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
    });
    return NextResponse.json({
      url: checkout.url,
      deposit_cents: depositCents,
      credit_applied_cents: creditApplied,
      stripe_charged_cents: split.stripeChargeCents,
    });
  } catch (err) {
    await admin
      .from('available_slots')
      .update({ status: 'open', hold_expires_at: null, held_by_user: null })
      .eq('id', slotId);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 },
    );
  }
}
