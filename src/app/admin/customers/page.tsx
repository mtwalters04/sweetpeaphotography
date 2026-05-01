import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtFullDate } from '@/lib/dates';

export const metadata = { title: 'Customers · Admin' };

export default async function CustomersIndex({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const stage = sp.stage;

  const supabase = await createClient();
  let query = supabase
    .from('profiles')
    .select('id, full_name, email, lifecycle_stage, tags, last_contact_at, created_at')
    .neq('role', 'super_admin')
    .order('created_at', { ascending: false });
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }
  if (stage && ['lead', 'active', 'past_client', 'dormant'].includes(stage)) {
    query = query.eq('lifecycle_stage', stage as 'lead' | 'active' | 'past_client' | 'dormant');
  }
  const { data: customers } = await query.limit(200);

  return (
    <>
      <div className="flex items-center justify-between mb-10 flex-wrap gap-6">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-2">CRM</p>
          <h2 className="font-serif text-t-28">Customers</h2>
        </div>
        <form action="/admin/customers" method="get">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Name or email…"
            className="bg-transparent border-b border-ink/30 focus:border-ink py-2 text-t-14 outline-none font-light w-64"
          />
        </form>
      </div>

      <ul className="flex flex-wrap gap-2 text-t-12 eyebrow-label mb-10">
        <li>
          <Link
            href="/admin/customers"
            className={`border px-3 py-2 ${
              !stage ? 'border-ink text-ink' : 'border-mist text-ash hover:border-ink'
            }`}
          >
            All
          </Link>
        </li>
        {(['lead', 'active', 'past_client', 'dormant'] as const).map((s) => (
          <li key={s}>
            <Link
              href={`/admin/customers?stage=${s}`}
              className={`border px-3 py-2 ${
                stage === s ? 'border-ink text-ink' : 'border-mist text-ash hover:border-ink'
              }`}
            >
              {s.replace('_', ' ')}
            </Link>
          </li>
        ))}
      </ul>

      {customers && customers.length > 0 ? (
        <ul className="border-y border-mist divide-y divide-mist">
          {customers.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/customers/${c.id}`}
                className="grid grid-cols-12 gap-6 py-5 items-baseline hover:text-accent transition-colors"
              >
                <div className="col-span-12 md:col-span-4">
                  <p className="font-serif text-t-22">{c.full_name ?? '—'}</p>
                  <p className="text-ash text-t-12 font-light mt-1">{c.email}</p>
                </div>
                <p className="col-span-6 md:col-span-2 text-t-12 eyebrow-label text-ash">
                  {c.lifecycle_stage ?? 'unset'}
                </p>
                <p className="col-span-6 md:col-span-3 text-ash text-t-12 font-light truncate">
                  {c.tags.length > 0 ? c.tags.join(' · ') : '—'}
                </p>
                <p className="col-span-12 md:col-span-3 text-ash text-t-12 font-light">
                  Last: {fmtFullDate(c.last_contact_at) ?? '—'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-y border-mist py-16 text-center">
          <p className="text-t-22 text-ash">No customers match.</p>
        </div>
      )}
    </>
  );
}
