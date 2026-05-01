import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Photographers · Admin' };

export default async function PhotographersIndex() {
  const supabase = await createClient();
  const { data: people } = await supabase
    .from('photographers')
    .select('id, public_name, public_bio, order_index, active')
    .order('order_index')
    .order('public_name');

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-2">Studio</p>
          <h2 className="font-serif text-t-28">Photographers</h2>
        </div>
        <Link
          href="/admin/photographers/new"
          className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-300"
        >
          New →
        </Link>
      </div>

      {people && people.length > 0 ? (
        <ul className="border-y border-mist divide-y divide-mist">
          {people.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/photographers/${p.id}/edit`}
                className="flex items-baseline justify-between gap-6 py-5 hover:text-accent transition-colors"
              >
                <div>
                  <p className="font-serif text-t-22">{p.public_name}</p>
                  {p.public_bio && (
                    <p className="text-ash text-t-14 font-light max-w-prose mt-1 line-clamp-1">
                      {p.public_bio}
                    </p>
                  )}
                </div>
                <span className="text-ash text-t-12 eyebrow-label">
                  {p.active ? 'Active' : 'Inactive'} · #{p.order_index}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty href="/admin/photographers/new" label="Add the first photographer →" />
      )}
    </>
  );
}

function Empty({ href, label }: { href: string; label: string }) {
  return (
    <div className="border-y border-mist py-16 text-center">
      <p className="text-t-22 text-ash">Nothing yet.</p>
      <Link
        href={href}
        className="inline-block mt-6 text-t-14 underline underline-offset-4 hover:text-accent"
      >
        {label}
      </Link>
    </div>
  );
}
