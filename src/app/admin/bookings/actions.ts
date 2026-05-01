'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { sendEmail } from '@/lib/resend';
import { CreditIssuedEmail } from '@/lib/emails/templates';
import { env } from '@/lib/env';
import type { Database } from '@/lib/supabase/database.types';

type Stage = Database['public']['Enums']['pipeline_stage'];

export async function setStage(bookingId: string, stage: Stage): Promise<void> {
  const { supabase } = await requireStaff();
  await supabase.from('bookings').update({ pipeline_stage: stage }).eq('id', bookingId);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath('/admin/bookings');
}

export async function setNotes(bookingId: string, notes: string): Promise<void> {
  const { supabase } = await requireStaff();
  await supabase.from('bookings').update({ notes }).eq('id', bookingId);
  revalidatePath(`/admin/bookings/${bookingId}`);
}

export type CancelInput = {
  bookingId: string;
  by: 'customer' | 'studio';
  reason: string;
  // 'forfeit' = customer cancelled <48h, no credit. 'credit_full' = full deposit → credit.
  // 'credit_partial' = some custom amount.
  refund: 'forfeit' | 'credit_full' | 'credit_custom';
  customCreditCents?: number;
};

export async function cancelBooking(input: CancelInput): Promise<void> {
  const { supabase, userId } = await requireStaff();
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, customer_id, slot_id, deposit_cents, profiles:customer_id(email, full_name)')
    .eq('id', input.bookingId)
    .single();
  if (!booking) throw new Error('Booking not found.');

  await supabase
    .from('bookings')
    .update({
      pipeline_stage: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: input.by,
      cancellation_reason: input.reason,
    })
    .eq('id', booking.id);

  // Open the slot back up so it can be re-booked or re-published.
  await supabase
    .from('available_slots')
    .update({ status: 'open', hold_expires_at: null, held_by_user: null })
    .eq('id', booking.slot_id);

  // Issue credit per business rules. Studio-cancel always = full credit.
  // Customer-cancel: 'credit_full' (≥48h before), 'forfeit' (<48h), 'credit_custom' for edge cases.
  const credit =
    input.by === 'studio'
      ? booking.deposit_cents
      : input.refund === 'credit_full'
        ? booking.deposit_cents
        : input.refund === 'credit_custom'
          ? Math.max(0, input.customCreditCents ?? 0)
          : 0;

  if (credit > 0) {
    await supabase.from('credit_ledger').insert({
      customer_id: booking.customer_id,
      amount_cents: credit,
      reason:
        input.by === 'studio' ? 'studio_cancel' : 'customer_cancel_48h+',
      booking_id: booking.id,
      issued_by: userId,
      notes: input.reason,
    });
    if (booking.profiles?.email) {
      await sendEmail({
        to: booking.profiles.email,
        subject: 'A studio credit is on your account.',
        react: CreditIssuedEmail({
          customerName: booking.profiles.full_name ?? 'there',
          amountCents: credit,
          reason:
            input.by === 'studio'
              ? 'We needed to cancel from our side.'
              : 'Cancelling more than 48 hours before the shoot earns full deposit credit.',
          accountUrl: `${env.siteUrl()}/account`,
        }),
      });
    }
  }

  revalidatePath(`/admin/bookings/${booking.id}`);
  revalidatePath('/admin/bookings');
}

export async function issueManualCredit({
  customerId,
  amountCents,
  notes,
}: {
  customerId: string;
  amountCents: number;
  notes: string;
}): Promise<void> {
  const { supabase, userId } = await requireStaff();
  await supabase.from('credit_ledger').insert({
    customer_id: customerId,
    amount_cents: amountCents,
    reason: 'manual',
    issued_by: userId,
    notes,
  });
  revalidatePath('/admin/credits');
}
