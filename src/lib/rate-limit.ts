import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';

// Fixed-window rate limiter backed by Postgres (rate_limit_check RPC).
// One round-trip per check; rows pruned by the release-holds cron.

type Limiter = { window: number; max: number; prefix: string };

export const limiters = {
  // 5 attempts per IP per minute — covers signin, signup, magic link.
  auth: { window: 60, max: 5, prefix: 'auth' },
  // 3 contact submissions per key per hour.
  contact: { window: 3600, max: 3, prefix: 'contact' },
  // 60 presigns per user per hour.
  presign: { window: 3600, max: 60, prefix: 'presign' },
} as const satisfies Record<string, Limiter>;

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  );
}

export async function checkLimit(
  limiter: Limiter,
  key: string,
): Promise<{ ok: boolean; retryAfterSeconds?: number }> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('rate_limit_check', {
    p_key: `${limiter.prefix}:${key}`,
    p_window_seconds: limiter.window,
    p_max: limiter.max,
  });
  // Fail-open on RPC error so a transient DB blip doesn't lock users out.
  const row = data?.[0];
  if (error || !row) return { ok: true };
  return row.allowed
    ? { ok: true }
    : { ok: false, retryAfterSeconds: row.retry_after_seconds };
}
