import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { ShootReminderEmail } from '@/lib/emails/templates';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/cron/reminders — daily, 14:00 UTC.
// Sends T-7 reminder to bookings whose start is between 7d and 7d+24h from now,
// once. Tracks via email_log to be idempotent.
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization') ?? '';
  if (env.cronSecret() && auth !== `Bearer ${env.cronSecret()}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const windowStart = new Date(now + 7 * 24 * 3600 * 1000).toISOString();
  const windowEnd = new Date(now + 8 * 24 * 3600 * 1000).toISOString();

  const { data: bookings } = await admin
    .from('bookings')
    .select(`
      id, starts_at,
      profiles!customer_id (full_name, email),
      session_types (name)
    `)
    .gte('starts_at', windowStart)
    .lt('starts_at', windowEnd)
    .neq('pipeline_stage', 'cancelled');

  let sent = 0;
  for (const b of bookings ?? []) {
    if (!b.profiles?.email) continue;

    // Idempotency: skip if reminder already sent for this booking.
    const { count } = await admin
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .eq('booking_id', b.id)
      .eq('template', 'shoot_reminder');
    if ((count ?? 0) > 0) continue;

    const url = `${env.siteUrl()}/account/bookings/${b.id}`;
    const r = await sendEmail({
      to: b.profiles.email,
      subject: 'A week to go.',
      react: ShootReminderEmail({
        customerName: b.profiles.full_name ?? 'there',
        sessionTypeName: b.session_types?.name ?? 'session',
        startsAt: b.starts_at,
        manageUrl: url,
      }),
    });
    await admin.from('email_log').insert({
      booking_id: b.id,
      to_email: b.profiles.email,
      subject: 'A week to go.',
      template: 'shoot_reminder',
      resend_id: r.id ?? null,
      error: r.error ?? null,
    });
    if (r.ok && !r.skipped) sent += 1;
  }

  return NextResponse.json({ candidates: bookings?.length ?? 0, sent });
}
