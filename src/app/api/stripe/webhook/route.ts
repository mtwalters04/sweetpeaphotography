import { type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { confirmBooking } from '@/lib/bookings';
import { sendEmail } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/server';
import {
  AdminNewBookingEmail,
  BookingConfirmedEmail,
} from '@/lib/emails/templates';

export const runtime = 'nodejs';
// Stripe needs the raw body for signature verification.
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

    let result: { bookingId: string; created: boolean };
    try {
      result = await confirmBooking({
        slotId: meta.slot_id,
        customerId: meta.customer_id,
        amountCents,
        depositCents,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        stripeCheckoutSessionId: session.id,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('confirmBooking failed', err);
      return new Response('Internal error', { status: 500 });
    }

    if (result.created) {
      // Fire confirmation emails. Don't block the webhook on email failures.
      const admin = createAdminClient();
      const { data: booking } = await admin
        .from('bookings')
        .select(`
          id,
          starts_at,
          amount_cents,
          deposit_cents,
          profiles:customer_id (full_name, email),
          session_types (name)
        `)
        .eq('id', result.bookingId)
        .single();

      if (booking) {
        const customerName = booking.profiles?.full_name ?? booking.profiles?.email ?? 'there';
        const customerEmail = booking.profiles?.email ?? '';
        const sessionTypeName = booking.session_types?.name ?? 'session';
        const manageUrl = `${env.siteUrl()}/account/bookings/${booking.id}`;
        const adminUrl = `${env.siteUrl()}/admin/bookings/${booking.id}`;

        if (customerEmail) {
          const r1 = await sendEmail({
            to: customerEmail,
            subject: 'Your session is on the calendar.',
            react: BookingConfirmedEmail({
              customerName,
              sessionTypeName,
              startsAt: booking.starts_at,
              amountCents: booking.amount_cents,
              depositCents: booking.deposit_cents,
              manageUrl,
            }),
          });
          await admin.from('email_log').insert({
            booking_id: booking.id,
            to_email: customerEmail,
            subject: 'Your session is on the calendar.',
            template: 'booking_confirmed',
            resend_id: r1.id ?? null,
            error: r1.error ?? null,
          });
        }

        const r2 = await sendEmail({
          to: env.studioNotificationEmail(),
          subject: `New booking — ${customerName}`,
          react: AdminNewBookingEmail({
            customerName,
            customerEmail,
            sessionTypeName,
            startsAt: booking.starts_at,
            amountCents: booking.amount_cents,
            depositCents: booking.deposit_cents,
            adminUrl,
          }),
        });
        await admin.from('email_log').insert({
          booking_id: booking.id,
          to_email: env.studioNotificationEmail(),
          subject: `New booking — ${customerName}`,
          template: 'admin_new_booking',
          resend_id: r2.id ?? null,
          error: r2.error ?? null,
        });
      }
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
