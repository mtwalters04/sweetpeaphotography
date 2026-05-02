import { createAdminClient } from '@/lib/supabase/server';

/**
 * Idempotent: inserts a negative ledger row when Stripe collected part of the deposit
 * and booking.credit_applied_cents records the portion taken from studio credit.
 */
export async function ensureCheckoutCreditRedemptionInLedger(bookingId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: booking } = await admin
    .from('bookings')
    .select('customer_id, credit_applied_cents')
    .eq('id', bookingId)
    .maybeSingle();
  if (!booking || !booking.credit_applied_cents || booking.credit_applied_cents <= 0) return;

  const { data: existing } = await admin
    .from('credit_ledger')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('reason', 'applied_to_booking')
    .lt('amount_cents', 0)
    .maybeSingle();
  if (existing) return;

  await admin.from('credit_ledger').insert({
    customer_id: booking.customer_id,
    amount_cents: -booking.credit_applied_cents,
    reason: 'applied_to_booking',
    booking_id: bookingId,
    issued_by: null,
    notes: null,
  });
}
