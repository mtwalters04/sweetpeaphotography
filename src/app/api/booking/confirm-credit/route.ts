import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendBookingConfirmationEmails } from '@/lib/booking-confirmation-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Finalize a booking when the deposit is fully covered by studio credit (no Stripe charge).
 * The slot must already be held by the caller via /api/checkout.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in.' }, { status: 401 });

  let body: { slot_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }
  const slotId = body.slot_id;
  if (!slotId) return NextResponse.json({ error: 'slot_id required.' }, { status: 400 });

  const { data: bookingId, error } = await supabase.rpc('confirm_booking_with_credit_only', {
    p_slot_id: slotId,
  });

  if (error?.message?.includes('INSUFFICIENT_CREDIT')) {
    return NextResponse.json({ error: 'Insufficient studio credit.' }, { status: 400 });
  }
  if (
    error?.message?.includes('SLOT_NOT_HELD') ||
    error?.message?.includes('slot not held') ||
    error?.message?.includes('NOT_HELD')
  ) {
    return NextResponse.json(
      { error: 'Hold expired or missing. Refresh and try again.' },
      { status: 409 },
    );
  }
  if (error) {
    // eslint-disable-next-line no-console
    console.error('confirm_booking_with_credit_only', error);
    return NextResponse.json({ error: error.message ?? 'Could not confirm.' }, { status: 400 });
  }

  if (!bookingId) return NextResponse.json({ error: 'No booking returned.' }, { status: 500 });

  await sendBookingConfirmationEmails(bookingId);

  return NextResponse.json({
    ok: true as const,
    booking_id: bookingId,
    redirect_url: `/account/bookings/${bookingId}`,
  });
}
