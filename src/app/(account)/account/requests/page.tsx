import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtFullDate } from '@/lib/dates';
import { formatUsd } from '@/lib/money';

export const metadata: Metadata = { title: 'Requests' };

export default async function AccountRequests() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from('custom_requests')
    .select('id, status, preferred_date, message, quote_amount_cents, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      {requests && requests.length > 0 ? (
        <ul className="border-y border-mist divide-y divide-mist">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/account/requests/${r.id}`}
                className="grid grid-cols-12 gap-6 py-5 items-baseline hover:text-accent transition-colors"
              >
                <p className="col-span-12 md:col-span-3 font-serif text-t-22">
                  {r.preferred_date ? fmtFullDate(r.preferred_date) : 'Open date'}
                </p>
                <p className="col-span-12 md:col-span-5 text-ash text-t-14 font-light line-clamp-1">
                  {r.message}
                </p>
                <p className="col-span-6 md:col-span-2 font-serif text-t-18">
                  {r.quote_amount_cents ? formatUsd(r.quote_amount_cents) : '—'}
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
          <p className="text-t-22 text-ash">No requests yet.</p>
          <Link href="/contact" className="inline-block mt-6 text-t-14 underline hover:text-accent">
            Request a custom date →
          </Link>
        </div>
      )}
    </div>
  );
}
