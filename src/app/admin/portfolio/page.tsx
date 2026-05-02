import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Portfolio · Admin' };

type Row = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  order_index: number;
};

export default async function PortfolioIndex() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('portfolio_collections')
    .select('id, slug, title, published, order_index')
    .order('order_index')
    .order('created_at', { ascending: false });
  const collections = (data ?? []) as Row[];

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-2">Showcase</p>
          <h2 className="font-serif text-t-28">Portfolio collections</h2>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent"
        >
          New →
        </Link>
      </div>

      {collections.length > 0 ? (
        <ul className="border-y border-mist divide-y divide-mist">
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link
                href={`/admin/portfolio/${collection.id}/edit`}
                className="grid grid-cols-12 gap-6 py-5 items-baseline hover:text-accent transition-colors"
              >
                <div className="col-span-12 md:col-span-7">
                  <p className="font-serif text-t-22">{collection.title}</p>
                  <p className="text-ash text-t-12 eyebrow-label mt-1">/{collection.slug}</p>
                </div>
                <p className="col-span-6 md:col-span-3 text-ash text-t-14 font-light">
                  order {collection.order_index}
                </p>
                <p className="col-span-6 md:col-span-2 text-right md:text-left text-t-12 eyebrow-label">
                  {collection.published ? 'Published' : 'Draft'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-y border-mist py-16 text-center">
          <p className="text-t-22 text-ash">No collections yet.</p>
          <Link
            href="/admin/portfolio/new"
            className="inline-block mt-6 text-t-14 underline hover:text-accent"
          >
            Add the first one →
          </Link>
        </div>
      )}
    </>
  );
}
