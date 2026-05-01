import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtDateAndTime } from '@/lib/dates';
import { formatUsd } from '@/lib/money';

export const metadata = { title: 'Bookings · Admin' };

const STAGES = [
  'booked',
  'shoot_scheduled',
  'shoot_complete',
  'editing',
  'delivered',
  'archived',
  'cancelled',
] as const;

export default async function BookingsIndex({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const sp = await searchParams;
  const stage = sp.stage && (STAGES as readonly string[]).includes(sp.stage) ? sp.stage : null;

  const supabase = await createClient();
  let query = supabase
    .from('bookings')
    .select(`
      id,
      starts_at,
      amount_cents,
      pipeline_stage,
      profiles:customer_id (full_name, email),
      session_types (name)
    `)
    .order('starts_at', { ascending: true });
  if (stage) query = query.eq('pipeline_stage', stage as (typeof STAGES)[number]);

  const { data: bookings } = await query;

  return (
    <>
      <div className="flex items-center justify-between mb-10 flex-wrap gap-6">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-2">Pipeline</p>
          <h2 className="font-serif text-t-28">Bookings</h2>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2 text-t-12 eyebrow-label mb-10">
        <li>
          <Link
            href="/admin/bookings"
            className={`border px-3 py-2 transition-colors ${
              !stage ? 'border-ink text-ink' : 'border-mist text-ash hover:border-ink hover:text-ink'
            }`}
          >
            All
          </Link>
        </li>
        {STAGES.map((s) => (
          <li key={s}>
            <Link
              href={`/admin/bookings?stage=${s}`}
              className={`border px-3 py-2 transition-colors ${
                stage === s ? 'border-ink text-ink' : 'border-mist text-ash hover:border-ink hover:text-ink'
              }`}
            >
              {s.replace('_', ' ')}
            </Link>
          </li>
        ))}
      </ul>

      {bookings && bookings.length > 0 ? (
        <ul className="border-y border-mist divide-y divide-mist">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/bookings/${b.id}`}
                className="grid grid-cols-12 gap-6 py-5 items-baseline hover:text-accent transition-colors"
              >
                <p className="col-span-12 md:col-span-3 font-serif text-t-22">
                  {fmtDateAndTime(b.starts_at)}
                </p>
                <p className="col-span-6 md:col-span-3">
                  {b.profiles?.full_name ?? b.profiles?.email ?? '—'}
                </p>
                <p className="col-span-6 md:col-span-3 text-ash text-t-14 font-light">
                  {b.session_types?.name ?? '—'}
                </p>
                <p className="col-span-6 md:col-span-2 font-serif text-t-18">
                  {formatUsd(b.amount_cents)}
                </p>
                <p className="col-span-6 md:col-span-1 text-t-12 eyebrow-label text-ash">
                  {b.pipeline_stage}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-y border-mist py-16 text-center">
          <p className="text-t-22 text-ash">No bookings.</p>
        </div>
      )}
    </>
  );
}
