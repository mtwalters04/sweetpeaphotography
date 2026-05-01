import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtFullDate } from '@/lib/dates';

export const metadata = { title: 'Requests · Admin' };

const STATUSES = ['pending', 'quoted', 'accepted', 'declined', 'withdrawn', 'converted'] as const;

export default async function RequestsIndex({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status && (STATUSES as readonly string[]).includes(sp.status) ? sp.status : null;

  const supabase = await createClient();
  let query = supabase
    .from('custom_requests')
    .select(`
      id, status, message, preferred_date, created_at,
      profiles!customer_id (full_name, email)
    `)
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status as (typeof STATUSES)[number]);
  const { data: requests } = await query;

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-2">Inbox</p>
          <h2 className="font-serif text-t-28">Custom requests</h2>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2 text-t-12 eyebrow-label mb-10">
        <li>
          <Link
            href="/admin/requests"
            className={`border px-3 py-2 transition-colors ${
              !status ? 'border-ink text-ink' : 'border-mist text-ash hover:border-ink hover:text-ink'
            }`}
          >
            All
          </Link>
        </li>
        {STATUSES.map((s) => (
          <li key={s}>
            <Link
              href={`/admin/requests?status=${s}`}
              className={`border px-3 py-2 transition-colors ${
                status === s ? 'border-ink text-ink' : 'border-mist text-ash hover:border-ink hover:text-ink'
              }`}
            >
              {s}
            </Link>
          </li>
        ))}
      </ul>

      {requests && requests.length > 0 ? (
        <ul className="border-y border-mist divide-y divide-mist">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/requests/${r.id}`}
                className="grid grid-cols-12 gap-6 py-5 items-baseline hover:text-accent transition-colors"
              >
                <p className="col-span-12 md:col-span-3 font-serif text-t-22">
                  {r.profiles?.full_name ?? r.profiles?.email ?? '—'}
                </p>
                <p className="col-span-6 md:col-span-3 text-ash text-t-14 font-light">
                  {r.preferred_date ? fmtFullDate(r.preferred_date) : 'Open date'}
                </p>
                <p className="col-span-12 md:col-span-4 text-ash text-t-14 font-light line-clamp-1">
                  {r.message}
                </p>
                <p className="col-span-6 md:col-span-2 text-t-12 eyebrow-label text-ash">
                  {r.status}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-y border-mist py-16 text-center">
          <p className="text-t-22 text-ash">No requests in this view.</p>
        </div>
      )}
    </>
  );
}
