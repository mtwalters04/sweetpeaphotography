import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtDateAndTime } from '@/lib/dates';
import { formatUsd } from '@/lib/money';

export const metadata: Metadata = { title: 'Account' };

export default async function AccountOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: bookings }, { data: requests }, { data: balance }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, starts_at, pipeline_stage, session_types(name)')
      .neq('pipeline_stage', 'archived')
      .order('starts_at', { ascending: true })
      .limit(5),
    supabase
      .from('custom_requests')
      .select('id, status, preferred_date, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('credit_balances').select('balance_cents').eq('customer_id', user.id).maybeSingle(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      <Section title="Credit balance">
        <p className="font-serif text-t-48 leading-none">{formatUsd(balance?.balance_cents ?? 0)}</p>
        <p className="text-ash text-t-12 mt-3 font-light italic">Applies to any future booking.</p>
      </Section>

      <Section title="Upcoming sessions">
        {bookings && bookings.length > 0 ? (
          <ul className="space-y-3 text-t-14">
            {bookings.map((b) => (
              <li key={b.id} className="border-b border-mist pb-3">
                <Link href={`/account/bookings/${b.id}`} className="hover:text-accent">
                  <p className="font-serif text-t-18">{fmtDateAndTime(b.starts_at)}</p>
                  <p className="text-ash text-t-12 eyebrow-label mt-1">
                    {b.session_types?.name} · {b.pipeline_stage.replace('_', ' ')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty
            text="No upcoming sessions."
            cta={{ href: '/book', label: 'See available dates →' }}
          />
        )}
      </Section>

      <Section title="Custom requests">
        {requests && requests.length > 0 ? (
          <ul className="space-y-3 text-t-14">
            {requests.map((r) => (
              <li key={r.id} className="border-b border-mist pb-3">
                <Link href={`/account/requests/${r.id}`} className="hover:text-accent">
                  <p className="font-serif text-t-18">
                    {r.preferred_date ? fmtDateAndTime(r.preferred_date) : 'Open request'}
                  </p>
                  <p className="text-ash text-t-12 eyebrow-label mt-1">{r.status}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty
            text="No requests submitted."
            cta={{ href: '/contact', label: 'Request a custom date →' }}
          />
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-ash text-t-12 eyebrow-label mb-4">{title}</p>
      <div className="border-t border-mist pt-6 min-h-[180px]">{children}</div>
    </section>
  );
}

function Empty({ text, cta }: { text: string; cta: { href: string; label: string } }) {
  return (
    <div>
      <p className="text-t-16 text-ash font-light">{text}</p>
      <Link
        href={cta.href}
        className="inline-block mt-4 text-t-14 underline underline-offset-4 hover:text-accent"
      >
        {cta.label}
      </Link>
    </div>
  );
}
