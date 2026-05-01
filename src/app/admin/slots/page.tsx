import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtDateAndTime } from '@/lib/dates';
import { formatUsd } from '@/lib/money';

export const metadata = { title: 'Slots · Admin' };

export default async function SlotsIndex() {
  const supabase = await createClient();
  const { data: slots } = await supabase
    .from('available_slots')
    .select(`
      id,
      starts_at,
      duration_minutes,
      price_cents,
      status,
      location_label,
      private_for_user,
      session_types (name, slug),
      photographers (public_name)
    `)
    .order('starts_at', { ascending: true });

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-2">Calendar</p>
          <h2 className="font-serif text-t-28">Slots</h2>
        </div>
        <Link
          href="/admin/slots/new"
          className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent"
        >
          New →
        </Link>
      </div>

      {slots && slots.length > 0 ? (
        <ul className="border-y border-mist divide-y divide-mist">
          {slots.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/slots/${s.id}/edit`}
                className="grid grid-cols-12 gap-6 py-5 items-baseline hover:text-accent transition-colors"
              >
                <p className="col-span-12 md:col-span-4 font-serif text-t-22">
                  {fmtDateAndTime(s.starts_at)}
                </p>
                <p className="col-span-6 md:col-span-3 text-ash text-t-14 font-light">
                  {s.session_types?.name ?? '—'}
                </p>
                <p className="col-span-6 md:col-span-2 text-ash text-t-14 font-light">
                  {s.photographers?.public_name ?? '—'}
                </p>
                <p className="col-span-6 md:col-span-2 font-serif text-t-18">
                  {formatUsd(s.price_cents)}
                </p>
                <p className="col-span-6 md:col-span-1 text-t-12 eyebrow-label text-ash">
                  {s.private_for_user ? `${s.status} · private` : s.status}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-y border-mist py-16 text-center">
          <p className="text-t-22 text-ash">No slots published.</p>
          <Link
            href="/admin/slots/new"
            className="inline-block mt-6 text-t-14 underline hover:text-accent"
          >
            Publish a slot →
          </Link>
        </div>
      )}
    </>
  );
}
