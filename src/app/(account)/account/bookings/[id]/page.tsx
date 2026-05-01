import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtDateAndTime } from '@/lib/dates';
import { formatUsd } from '@/lib/money';

export const metadata: Metadata = { title: 'Booking detail' };

export default async function CustomerBookingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      session_types (name, summary),
      photographers (public_name)
    `)
    .eq('id', id)
    .single();
  if (!booking) notFound();

  const { data: gallery } = await supabase
    .from('gallery_items')
    .select('id, file_name, kind')
    .eq('booking_id', id)
    .eq('kind', 'delivery_zip')
    .order('order_index')
    .limit(1);

  return (
    <div className="max-w-prose mx-auto">
      <Link
        href="/account/bookings"
        className="text-ash text-t-12 eyebrow-label hover:text-accent"
      >
        ← All bookings
      </Link>

      <p className="text-ash text-t-12 eyebrow-label mt-12 mb-3">
        {booking.session_types?.name ?? 'Session'}
      </p>
      <h1 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.015em]">
        {fmtDateAndTime(booking.starts_at)}
      </h1>
      {booking.photographers?.public_name && (
        <p className="text-ash text-t-16 font-light italic mt-3">
          With {booking.photographers.public_name}
        </p>
      )}

      <dl className="grid grid-cols-3 gap-6 mt-12 border-y border-mist py-8">
        <Field label="Total" value={formatUsd(booking.amount_cents)} />
        <Field label="Deposit paid" value={formatUsd(booking.deposit_cents)} />
        <Field
          label="Balance due"
          value={formatUsd(booking.amount_cents - booking.deposit_cents)}
        />
      </dl>

      <p className="text-ash text-t-12 eyebrow-label mt-12 mb-3">Status</p>
      <p className="font-serif text-t-28 capitalize">
        {booking.cancelled_at ? 'Cancelled' : booking.pipeline_stage.replace('_', ' ')}
      </p>

      {gallery && gallery.length > 0 && (
        <div className="mt-12 border border-mist p-6 bg-vellum/40">
          <p className="text-ash text-t-12 eyebrow-label mb-3">Gallery</p>
          <p className="font-serif text-t-22">Your photographs are ready.</p>
          <Link
            href={`/account/bookings/${id}/gallery`}
            className="inline-block mt-4 text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent"
          >
            Open gallery →
          </Link>
        </div>
      )}

      <p className="text-t-14 text-ash font-light italic mt-12 leading-relaxed">
        Need to change something? Reply to your confirmation email or write to us. Cancellations
        made 48+ hours before the shoot become studio credit on your account.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ash text-t-12 eyebrow-label mb-1">{label}</dt>
      <dd className="font-serif text-t-22">{value}</dd>
    </div>
  );
}
