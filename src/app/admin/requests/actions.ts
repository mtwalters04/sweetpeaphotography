'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { dollarsToCents, computeDeposit } from '@/lib/money';
import { sendEmail } from '@/lib/resend';
import {
  RequestQuotedEmail,
  RequestDeclinedEmail,
} from '@/lib/emails/templates';
import { env } from '@/lib/env';

export type State = { error: string | null; saved: boolean };

export async function postQuote(
  requestId: string,
  _prev: State,
  fd: FormData,
): Promise<State> {
  try {
    const { supabase } = await requireStaff();
    const amountDollars = String(fd.get('amount_dollars') ?? '');
    const amountCents = dollarsToCents(amountDollars);
    if (!amountCents) return { error: 'Quote amount required.', saved: false };
    const startsAt = String(fd.get('starts_at') ?? '');
    if (!startsAt) return { error: 'Slot start time required.', saved: false };
    const sessionTypeId = String(fd.get('session_type_id') ?? '');
    if (!sessionTypeId) return { error: 'Service required.', saved: false };
    const photographerId = String(fd.get('photographer_id') ?? '') || null;
    const durationMinutes = Number(fd.get('duration_minutes') ?? 60);
    const message = String(fd.get('message') ?? '').trim() || null;

    const { data: req } = await supabase
      .from('custom_requests')
      .select('id, customer_id, profiles!customer_id (full_name, email)')
      .eq('id', requestId)
      .single();
    if (!req) return { error: 'Request not found.', saved: false };

    // Create the private slot reserved for this customer.
    const { data: slot, error: slotErr } = await supabase
      .from('available_slots')
      .insert({
        session_type_id: sessionTypeId,
        photographer_id: photographerId,
        starts_at: new Date(startsAt).toISOString(),
        duration_minutes: durationMinutes,
        price_cents: amountCents,
        status: 'open',
        private_for_user: req.customer_id,
        private_request_id: req.id,
      })
      .select('id')
      .single();
    if (slotErr || !slot) return { error: slotErr?.message ?? 'Slot creation failed', saved: false };

    await supabase
      .from('custom_requests')
      .update({
        status: 'quoted',
        quote_amount_cents: amountCents,
        quote_message: message,
        quoted_at: new Date().toISOString(),
        quote_slot_id: slot.id,
      })
      .eq('id', req.id);

    if (req.profiles?.email) {
      const acceptUrl = `${env.siteUrl()}/account/requests/${req.id}`;
      await sendEmail({
        to: req.profiles.email,
        subject: 'Your quote is ready.',
        react: RequestQuotedEmail({
          customerName: req.profiles.full_name ?? 'there',
          amountCents,
          message,
          acceptUrl,
        }),
      });
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error', saved: false };
  }
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath('/admin/requests');
  return { error: null, saved: true };
}

export async function decline(
  requestId: string,
  _prev: State,
  fd: FormData,
): Promise<State> {
  try {
    const { supabase } = await requireStaff();
    const reason = String(fd.get('reason') ?? '').trim() || null;
    const { data: req } = await supabase
      .from('custom_requests')
      .select('id, profiles!customer_id (full_name, email)')
      .eq('id', requestId)
      .single();
    if (!req) return { error: 'Request not found.', saved: false };

    await supabase
      .from('custom_requests')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
        declined_reason: reason,
      })
      .eq('id', requestId);

    if (req.profiles?.email) {
      await sendEmail({
        to: req.profiles.email,
        subject: 'About your request.',
        react: RequestDeclinedEmail({
          customerName: req.profiles.full_name ?? 'there',
          reason,
        }),
      });
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error', saved: false };
  }
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath('/admin/requests');
  return { error: null, saved: true };
}

export async function addInternalNote(
  requestId: string,
  _prev: State,
  fd: FormData,
): Promise<State> {
  try {
    const { supabase, userId } = await requireStaff();
    const body = String(fd.get('body') ?? '').trim();
    if (!body) return { error: 'Note required.', saved: false };
    await supabase.from('request_messages').insert({
      request_id: requestId,
      author_id: userId,
      body,
      internal: true,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error', saved: false };
  }
  revalidatePath(`/admin/requests/${requestId}`);
  return { error: null, saved: true };
}
