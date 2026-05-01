'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import {
  AdminNewRequestEmail,
  RequestReceivedEmail,
} from '@/lib/emails/templates';
import { env } from '@/lib/env';
import { checkLimit, clientIp, limiters } from '@/lib/rate-limit';

export type RequestState = {
  error: string | null;
  ok: boolean;
  needsAccount: boolean;
  requestId?: string;
};

export async function submitCustomRequest(
  _prev: RequestState,
  fd: FormData,
): Promise<RequestState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: null, ok: false, needsAccount: true };

  const rl = await checkLimit(limiters.contact, user.id);
  if (!rl.ok) {
    return {
      error: `You've submitted several requests recently. Try again in ${Math.ceil((rl.retryAfterSeconds ?? 60) / 60)}m.`,
      ok: false,
      needsAccount: false,
    };
  }
  const ipRl = await checkLimit(limiters.contact, await clientIp());
  if (!ipRl.ok) {
    return {
      error: `Too many submissions from your network. Try again later.`,
      ok: false,
      needsAccount: false,
    };
  }

  const message = String(fd.get('message') ?? '').trim();
  if (!message) return { error: 'Tell us a little about the day.', ok: false, needsAccount: false };

  const preferred_date = String(fd.get('date') ?? '') || null;
  const preferred_time = String(fd.get('time') ?? '') || null;
  const preferred_session_type_slug = String(fd.get('service') ?? '') || null;
  const photographer_pref =
    (String(fd.get('photographer_pref') ?? 'either') as 'a' | 'b' | 'either' | 'none') ?? 'either';
  const location_hint = String(fd.get('location') ?? '').trim() || null;
  const referenceImageKeysRaw = String(fd.get('reference_image_keys') ?? '');
  const reference_image_keys = referenceImageKeysRaw
    ? (JSON.parse(referenceImageKeysRaw) as string[])
    : [];

  const { data: req, error } = await supabase
    .from('custom_requests')
    .insert({
      customer_id: user.id,
      preferred_date,
      preferred_time,
      preferred_session_type_slug,
      photographer_pref,
      location_hint,
      message,
      reference_image_keys,
    })
    .select('id')
    .single();
  if (error || !req) return { error: error?.message ?? 'Submit failed', ok: false, needsAccount: false };

  // Notify both sides. Admin client for the email_log writes (RLS).
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();
  const customerName = profile?.full_name ?? profile?.email ?? 'there';
  const customerEmail = profile?.email ?? '';

  const r1 = await sendEmail({
    to: customerEmail,
    subject: 'We received your request.',
    react: RequestReceivedEmail({
      customerName,
      manageUrl: `${env.siteUrl()}/account/requests/${req.id}`,
    }),
  });
  await admin.from('email_log').insert({
    request_id: req.id,
    to_email: customerEmail,
    subject: 'We received your request.',
    template: 'request_received',
    resend_id: r1.id ?? null,
    error: r1.error ?? null,
  });

  const r2 = await sendEmail({
    to: env.studioNotificationEmail(),
    subject: `New custom request — ${customerName}`,
    react: AdminNewRequestEmail({
      customerName,
      customerEmail,
      preferredDate: preferred_date,
      message,
      adminUrl: `${env.siteUrl()}/admin/requests/${req.id}`,
    }),
  });
  await admin.from('email_log').insert({
    request_id: req.id,
    to_email: env.studioNotificationEmail(),
    subject: `New custom request — ${customerName}`,
    template: 'admin_new_request',
    resend_id: r2.id ?? null,
    error: r2.error ?? null,
  });

  revalidatePath('/account/requests');
  return { error: null, ok: true, needsAccount: false, requestId: req.id };
}
