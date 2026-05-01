'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { dollarsToCents } from '@/lib/money';
import { sendEmail } from '@/lib/resend';
import { CreditIssuedEmail } from '@/lib/emails/templates';
import { env } from '@/lib/env';
import type { Database } from '@/lib/supabase/database.types';

type Stage = Database['public']['Enums']['lifecycle_stage'];

export type State = { error: string | null; saved: boolean };

export async function updateCustomer(
  id: string,
  _prev: State,
  fd: FormData,
): Promise<State> {
  try {
    const { supabase } = await requireStaff();
    const lifecycleRaw = String(fd.get('lifecycle_stage') ?? '');
    const lifecycle_stage = (['lead', 'active', 'past_client', 'dormant'].includes(lifecycleRaw)
      ? lifecycleRaw
      : null) as Stage | null;
    const tags = String(fd.get('tags') ?? '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const internal_notes = String(fd.get('internal_notes') ?? '').trim() || null;
    const last_contact_at = String(fd.get('last_contact_at') ?? '') || null;

    const { error } = await supabase
      .from('profiles')
      .update({
        lifecycle_stage,
        tags,
        internal_notes,
        last_contact_at: last_contact_at ? new Date(last_contact_at).toISOString() : null,
      })
      .eq('id', id);
    if (error) return { error: error.message, saved: false };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error', saved: false };
  }
  revalidatePath(`/admin/customers/${id}`);
  return { error: null, saved: true };
}

export async function issueCredit(
  customerId: string,
  _prev: State,
  fd: FormData,
): Promise<State> {
  try {
    const { supabase, userId } = await requireStaff();
    const amountCents = dollarsToCents(String(fd.get('amount_dollars') ?? ''));
    if (!amountCents) return { error: 'Amount required.', saved: false };
    const notes = String(fd.get('notes') ?? '').trim() || null;
    await supabase.from('credit_ledger').insert({
      customer_id: customerId,
      amount_cents: amountCents,
      reason: 'manual',
      issued_by: userId,
      notes,
    });
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', customerId)
      .single();
    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: 'A studio credit is on your account.',
        react: CreditIssuedEmail({
          customerName: profile.full_name ?? 'there',
          amountCents,
          reason: notes ?? 'A studio credit from us.',
          accountUrl: `${env.siteUrl()}/account`,
        }),
      });
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error', saved: false };
  }
  revalidatePath(`/admin/customers/${customerId}`);
  return { error: null, saved: true };
}
