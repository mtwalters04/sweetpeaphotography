import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { presignUpload } from '@/lib/r2';
import { env } from '@/lib/env';
import { checkLimit, limiters } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * POST /api/uploads/presign
 * body: { filename, contentType, size, kind: 'request' | 'gallery', booking_id?, request_id? }
 * Returns: { url, key }
 */
export async function POST(request: NextRequest) {
  if (!env.hasR2()) {
    return NextResponse.json({ error: 'Uploads are not yet configured.' }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to upload.' }, { status: 401 });

  const rl = await checkLimit(limiters.presign, user.id);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many uploads. Slow down.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds ?? 60) } },
    );
  }

  let body: {
    filename?: string;
    contentType?: string;
    size?: number;
    kind?: 'request' | 'gallery';
    booking_id?: string;
    request_id?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }
  const { filename, contentType, size, kind } = body;
  if (!filename || !contentType || !size || !kind) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
  }
  if (size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB).' }, { status: 400 });
  }

  // Gallery uploads must be staff and target a real booking.
  if (kind === 'gallery') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'photographer' && profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
    if (!body.booking_id) {
      return NextResponse.json({ error: 'booking_id required.' }, { status: 400 });
    }
    const { data: booking } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', body.booking_id)
      .single();
    if (!booking) {
      return NextResponse.json({ error: 'Unknown booking.' }, { status: 404 });
    }
  }

  // Request uploads: if a request_id is provided, the caller must own that request.
  if (kind === 'request' && body.request_id) {
    const { data: req } = await supabase
      .from('custom_requests')
      .select('customer_id')
      .eq('id', body.request_id)
      .single();
    if (!req || req.customer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const key =
    kind === 'gallery'
      ? `galleries/${body.booking_id ?? 'inbox'}/${Date.now()}-${safeName}`
      : `uploads/${user.id}/${body.request_id ?? 'inbox'}/${Date.now()}-${safeName}`;

  try {
    const url = await presignUpload(key, contentType);
    return NextResponse.json({ url, key });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Presign failed' },
      { status: 500 },
    );
  }
}
