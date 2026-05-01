import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtFullDate, fmtDateAndTime } from '@/lib/dates';
import { formatUsd } from '@/lib/money';
import { CrmForm, IssueCreditForm } from './CustomerForms';

export const metadata = { title: 'Customer · Admin' };

const toLocal = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};

export default async function CustomerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: customer }, { data: bookings }, { data: requests }, { data: balance }, { data: ledger }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase
        .from('bookings')
        .select('id, starts_at, amount_cents, pipeline_stage, session_types(name)')
        .eq('customer_id', id)
        .order('starts_at', { ascending: false })
        .limit(20),
      supabase
        .from('custom_requests')
        .select('id, status, message, preferred_date, created_at')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('credit_balances').select('balance_cents').eq('customer_id', id).maybeSingle(),
      supabase
        .from('credit_ledger')
        .select('id, amount_cents, reason, notes, created_at')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

  if (!customer) notFound();

  return (
    <>
      <Link href="/admin/customers" className="text-ash text-t-12 eyebrow-label hover:text-accent">
        ← All customers
      </Link>
      <header className="mt-10 mb-12">
        <p className="text-ash text-t-12 eyebrow-label mb-3">{customer.lifecycle_stage ?? 'unset'}</p>
        <h2 className="font-serif text-t-36 leading-tight">{customer.full_name ?? customer.email}</h2>
        <p className="text-ash text-t-14 font-light mt-2">
          {customer.email}
          {customer.phone && ` · ${customer.phone}`}
        </p>
      </header>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-7 space-y-12">
          <Block label="Bookings">
            {bookings && bookings.length > 0 ? (
              <ul className="border-y border-mist divide-y divide-mist text-t-14">
                {bookings.map((b) => (
                  <li key={b.id} className="py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="hover:text-accent">
                      <p className="font-serif text-t-18">{fmtDateAndTime(b.starts_at)}</p>
                      <p className="text-ash text-t-12 eyebrow-label">
                        {b.session_types?.name} · {formatUsd(b.amount_cents)} · {b.pipeline_stage}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ash text-t-14 font-light">None.</p>
            )}
          </Block>

          <Block label="Requests">
            {requests && requests.length > 0 ? (
              <ul className="border-y border-mist divide-y divide-mist text-t-14">
                {requests.map((r) => (
                  <li key={r.id} className="py-3">
                    <Link href={`/admin/requests/${r.id}`} className="hover:text-accent">
                      <p className="font-serif text-t-18">
                        {r.preferred_date ? fmtFullDate(r.preferred_date) : 'Open date'} ·{' '}
                        <span className="eyebrow-label text-ash">{r.status}</span>
                      </p>
                      <p className="text-ash text-t-12 font-light line-clamp-1">{r.message}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ash text-t-14 font-light">None.</p>
            )}
          </Block>

          <Block label="Credit ledger">
            <p className="font-serif text-t-36 mb-4">{formatUsd(balance?.balance_cents ?? 0)}</p>
            {ledger && ledger.length > 0 ? (
              <ul className="border-y border-mist divide-y divide-mist text-t-14">
                {ledger.map((l) => (
                  <li key={l.id} className="py-3 flex justify-between gap-4">
                    <span>
                      {l.reason}
                      {l.notes && <span className="text-ash"> · {l.notes}</span>}
                    </span>
                    <span className="font-serif">
                      {l.amount_cents > 0 ? '+' : ''}
                      {formatUsd(l.amount_cents)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ash text-t-14 font-light">No credits yet.</p>
            )}
          </Block>
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:col-start-9 space-y-12">
          <Block label="CRM">
            <CrmForm
              customerId={customer.id}
              initial={{
                lifecycle_stage: customer.lifecycle_stage ?? '',
                tags: customer.tags.join(', '),
                internal_notes: customer.internal_notes ?? '',
                last_contact_at_local: toLocal(customer.last_contact_at),
              }}
            />
          </Block>
          <Block label="Issue credit">
            <IssueCreditForm customerId={customer.id} />
          </Block>
        </aside>
      </div>
    </>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-ash text-t-12 eyebrow-label mb-4">{label}</p>
      {children}
    </section>
  );
}
