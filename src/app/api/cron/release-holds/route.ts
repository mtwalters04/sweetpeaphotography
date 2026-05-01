import { NextResponse, type NextRequest } from 'next/server';
import { releaseExpiredHolds } from '@/lib/bookings';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/cron/release-holds — runs every 5 min via Vercel cron.
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization') ?? '';
  if (env.cronSecret() && auth !== `Bearer ${env.cronSecret()}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const released = await releaseExpiredHolds();
  return NextResponse.json({ released });
}
