import { sendEmail } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { AdminNewBookingEmail, BookingConfirmedEmail } from '@/lib/emails/templates';

/** Customer + studio notification when a booking is confirmed (email failures are non-fatal). */
export async function sendBookingConfirmationEmails(bookingId: string): Promise<void> {
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
    .eq('id', bookingId)
    .single();

  if (!booking) return;

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
