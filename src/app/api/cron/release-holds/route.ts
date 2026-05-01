import { NextResponse, type NextRequest } from 'next/server';
import { releaseExpiredHolds } from '@/lib/bookings';
import { env } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/cron/release-holds — runs every 5 min via Vercel cron.
export async function GET(request: NextRequest) {
  const secret = env.cronSecret();
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = request.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const released = await releaseExpiredHolds();
  // Best-effort prune of old rate-limit windows (>24h).
  const { data: pruned } = await createAdminClient().rpc('rate_limit_prune', {
    p_older_than_seconds: 86400,
  });
  return NextResponse.json({ released, prunedRateLimits: pruned ?? 0 });
}
