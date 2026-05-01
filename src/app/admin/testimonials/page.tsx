import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Testimonials · Admin' };

export default async function TestimonialsIndex() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('testimonials')
    .select('*')
    .order('order_index')
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-2">Words from clients</p>
          <h2 className="font-serif text-t-28">Testimonials</h2>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent"
        >
          New →
        </Link>
      </div>

      {items && items.length > 0 ? (
        <ul className="border-y border-mist divide-y divide-mist">
          {items.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/testimonials/${t.id}/edit`}
                className="block py-5 hover:text-accent transition-colors"
              >
                <p className="font-serif text-t-22 italic font-light line-clamp-2">
                  “{t.quote}”
                </p>
                <p className="text-ash text-t-12 eyebrow-label mt-2">
                  {t.attribution} · {t.context ?? ''} · {t.approved ? 'approved' : 'draft'}
                  {t.featured && ' · featured'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-y border-mist py-16 text-center">
          <p className="text-t-22 text-ash">Nothing yet.</p>
          <Link
            href="/admin/testimonials/new"
            className="inline-block mt-6 text-t-14 underline hover:text-accent"
          >
            Add the first →
          </Link>
        </div>
      )}
    </>
  );
}
