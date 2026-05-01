import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { holdSlot } from '@/lib/bookings';
import { computeDeposit } from '@/lib/money';

export const runtime = 'nodejs';

/**
 * POST /api/checkout
 * body: { slot_id }
 * - Verifies user, holds slot, creates Stripe Checkout Session.
 * - Returns { url } the client redirects to.
 */
export async function POST(request: NextRequest) {
  if (!env.hasStripe()) {
    return NextResponse.json({ error: 'Payments are not yet configured.' }, { status: 503 });
  }

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

  // Read slot + session type with admin client (bypass RLS for private slots).
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
              description: `30% deposit · session ${new Date(slot.starts_at).toLocaleString('en-US')}`,
            },
            unit_amount: depositCents,
          },
        },
      ],
      metadata: {
        slot_id: slot.id,
        customer_id: user.id,
        amount_cents: String(slot.price_cents),
        deposit_cents: String(depositCents),
      },
      success_url: `${env.siteUrl()}/account/bookings?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl()}/book/${slot.id}?status=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 min
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    // Release the hold so the slot opens back up immediately.
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
