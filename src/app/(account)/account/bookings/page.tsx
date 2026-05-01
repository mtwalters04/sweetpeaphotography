import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtDateAndTime } from '@/lib/dates';
import { formatUsd } from '@/lib/money';

export const metadata: Metadata = { title: 'Bookings' };

export default async function AccountBookings({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, starts_at, amount_cents, deposit_cents, pipeline_stage, cancelled_at,
      session_types (name)
    `)
    .order('starts_at', { ascending: false });

  return (
    <div>
      {sp.status === 'success' && (
        <div className="border border-mist bg-vellum/40 p-6 mb-8">
          <p className="font-serif text-t-22">Your booking is confirmed.</p>
          <p className="text-ash text-t-14 font-light italic mt-1">
            A confirmation email is on its way.
          </p>
        </div>
      )}

      {bookings && bookings.length > 0 ? (
        <ul className="border-y border-mist divide-y divide-mist">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link
                href={`/account/bookings/${b.id}`}
                className="grid grid-cols-12 gap-6 py-5 items-baseline hover:text-accent transition-colors"
              >
                <p className="col-span-12 md:col-span-4 font-serif text-t-22">
                  {fmtDateAndTime(b.starts_at)}
                </p>
                <p className="col-span-6 md:col-span-3">{b.session_types?.name ?? '—'}</p>
                <p className="col-span-6 md:col-span-2 font-serif text-t-18">
                  {formatUsd(b.amount_cents)}
                </p>
                <p className="col-span-12 md:col-span-3 text-t-12 eyebrow-label text-ash">
                  {b.cancelled_at ? 'cancelled' : b.pipeline_stage.replace('_', ' ')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-y border-mist py-16 text-center">
          <p className="text-t-22 text-ash">No bookings yet.</p>
          <Link
            href="/book"
            className="inline-block mt-6 text-t-14 underline hover:text-accent"
          >
            See available dates →
          </Link>
        </div>
      )}
    </div>
  );
}
