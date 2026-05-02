import { type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { confirmBooking } from '@/lib/bookings';
import { createAdminClient } from '@/lib/supabase/server';
import { sendBookingConfirmationEmails } from '@/lib/booking-confirmation-email';
import { ensureCheckoutCreditRedemptionInLedger } from '@/lib/credit-ledger-redemption';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!env.hasStripe()) return new Response('Stripe not configured', { status: 503 });

  const sig = request.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });

  const raw = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, env.stripeWebhookSecret());
  } catch (err) {
    return new Response(
      `Bad signature: ${err instanceof Error ? err.message : 'unknown'}`,
      { status: 400 },
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    if (!meta.slot_id || !meta.customer_id) return new Response('Missing metadata', { status: 200 });

    const amountCents = Number(meta.amount_cents);
    const depositCents = Number(meta.deposit_cents);
    const creditAppliedCents = Number(meta.credit_applied_cents ?? 0);

    let result: { bookingId: string; created: boolean };
    try {
      result = await confirmBooking({
        slotId: meta.slot_id,
        customerId: meta.customer_id,
        amountCents,
        depositCents,
        creditAppliedCents: Number.isFinite(creditAppliedCents) ? creditAppliedCents : 0,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        stripeCheckoutSessionId: session.id,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('confirmBooking failed', err);
      return new Response('Internal error', { status: 500 });
    }

    let bookingId = result.bookingId;
    if (!result.created) {
      const admin = createAdminClient();
      const { data: row } = await admin
        .from('bookings')
        .select('id')
        .eq('stripe_checkout_session_id', session.id)
        .maybeSingle();
      if (row?.id) bookingId = row.id;
    }

    await ensureCheckoutCreditRedemptionInLedger(bookingId);

    const adminCheck = createAdminClient();
    const { data: alreadyConfirmed } = await adminCheck
      .from('email_log')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('template', 'booking_confirmed')
      .maybeSingle();
    if (!alreadyConfirmed) {
      await sendBookingConfirmationEmails(bookingId);
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const slotId = session.metadata?.slot_id;
    if (slotId) {
      const admin = createAdminClient();
      await admin
        .from('available_slots')
        .update({ status: 'open', hold_expires_at: null, held_by_user: null })
        .eq('id', slotId)
        .eq('status', 'held');
    }
  }

  return new Response('ok', { status: 200 });
}
