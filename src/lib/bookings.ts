// Server-side booking lifecycle helpers. Keep external-side-effects
// (email, Stripe) in the callers; this file only touches the database.

import { createAdminClient } from './supabase/server';

export const HOLD_MINUTES = 15;

/**
 * Atomically transition `open` → `held` for a single slot. Returns true if
 * the hold was acquired. Uses an UPDATE...WHERE status='open' so concurrent
 * checkouts can't double-hold the same slot.
 */
export async function holdSlot(slotId: string, userId: string): Promise<boolean> {
  // Lazy-release expired holds first — Hobby plan can't run sub-daily crons,
  // so we sweep here to avoid a 15-min hold sticking for a day.
  await releaseExpiredHolds().catch(() => undefined);
  const admin = createAdminClient();
  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString();
  const { data, error } = await admin
    .from('available_slots')
    .update({
      status: 'held',
      hold_expires_at: expiresAt,
      held_by_user: userId,
    })
    .eq('id', slotId)
    .eq('status', 'open')
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}

/** Release a hold (only if the requester owns it). */
export async function releaseHold(slotId: string, userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('available_slots')
    .update({ status: 'open', hold_expires_at: null, held_by_user: null })
    .eq('id', slotId)
    .eq('status', 'held')
    .eq('held_by_user', userId);
}

/** Cron-driven sweeper: release any held slot past its expiry. */
export async function releaseExpiredHolds(): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('available_slots')
    .update({ status: 'open', hold_expires_at: null, held_by_user: null })
    .lt('hold_expires_at', new Date().toISOString())
    .eq('status', 'held')
    .select('id');
  return data?.length ?? 0;
}

/**
 * Webhook-side: convert a held slot into a booking. Idempotent — if a booking
 * already exists for this checkout session id, returns the existing row.
 */
export async function confirmBooking(args: {
  slotId: string;
  customerId: string;
  amountCents: number;
  depositCents: number;
  creditAppliedCents?: number;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string;
}): Promise<{ bookingId: string; created: boolean }> {
  const admin = createAdminClient();

  // Idempotency check.
  const { data: existing } = await admin
    .from('bookings')
    .select('id')
    .eq('stripe_checkout_session_id', args.stripeCheckoutSessionId)
    .maybeSingle();
  if (existing) return { bookingId: existing.id, created: false };

  // Read slot to denormalize.
  const { data: slot, error: slotErr } = await admin
    .from('available_slots')
    .select('id, starts_at, session_type_id, photographer_id, private_request_id')
    .eq('id', args.slotId)
    .single();
  if (slotErr || !slot) throw new Error('Slot not found');

  const { data: booking, error: bookErr } = await admin
    .from('bookings')
    .insert({
      slot_id: slot.id,
      customer_id: args.customerId,
      session_type_id: slot.session_type_id,
      photographer_id: slot.photographer_id,
      starts_at: slot.starts_at,
      amount_cents: args.amountCents,
      deposit_cents: args.depositCents,
      credit_applied_cents: args.creditAppliedCents ?? 0,
      stripe_payment_intent_id: args.stripePaymentIntentId,
      stripe_checkout_session_id: args.stripeCheckoutSessionId,
      pipeline_stage: 'booked',
    })
    .select('id')
    .single();
  if (bookErr || !booking) throw new Error(bookErr?.message ?? 'Booking insert failed');

  // Flip slot to booked.
  await admin
    .from('available_slots')
    .update({ status: 'booked', hold_expires_at: null, held_by_user: null })
    .eq('id', slot.id);

  // If this slot came from a custom request, mark it converted.
  if (slot.private_request_id) {
    await admin
      .from('custom_requests')
      .update({ status: 'converted', converted_at: new Date().toISOString() })
      .eq('id', slot.private_request_id);
  }

  return { bookingId: booking.id, created: true };
}
