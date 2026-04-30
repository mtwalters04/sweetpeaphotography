import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { placeholderSrc } from '@/lib/placeholder';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Tagged "${decodeURIComponent(tag)}"`,
    description: `Journal posts tagged ${decodeURIComponent(tag)}.`,
  };
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export default async function TagArchive({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag).toLowerCase();
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, dek, hero_image_url, hero_image_alt, published_at')
    .eq('status', 'published')
    .contains('tags', [tag])
    .order('published_at', { ascending: false });

  return (
    <>
      <header className="pt-[clamp(128px,18vw,224px)] pb-[clamp(64px,8vw,128px)]">
        <div className="max-w-content mx-auto px-6">
          <Link
            href="/journal"
            className="text-ash text-t-12 uppercase tracking-[0.2em] hover:text-accent transition-colors"
          >
            ← Journal
          </Link>
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mt-12 mb-6">Tag</p>
          <h1 className="font-serif text-t-48 md:text-t-64 leading-[1.05]">{tag}</h1>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        {posts && posts.length > 0 ? (
          <ul className="max-w-content mx-auto px-6 divide-y divide-mist border-y border-mist">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/journal/${post.slug}`} className="block py-12 group">
                  <div className="grid grid-cols-12 gap-6 items-start">
                    <div className="col-span-12 md:col-span-4">
                      <div className="relative aspect-[4/3] bg-mist overflow-hidden">
                        <Image
                          src={post.hero_image_url || placeholderSrc(`journal-${post.slug}`, 800, 600)}
                          alt={post.hero_image_alt ?? ''}
                          fill
                          sizes="(min-width: 768px) 33vw, 100vw"
                          className="object-cover transition-opacity duration-500 group-hover:opacity-90"
                        />
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-8">
                      <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-3">
                        {fmt(post.published_at)}
                      </p>
                      <h2 className="font-serif text-t-36 leading-tight group-hover:text-accent transition-colors">
                        {post.title}
                      </h2>
                      {post.dek && (
                        <p className="text-t-18 text-ash mt-4 max-w-prose">{post.dek}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="max-w-content mx-auto px-6 text-center py-16 border-y border-mist">
            <p className="text-t-22 text-ash">No posts under that tag yet.</p>
          </div>
        )}
      </section>
    </>
  );
}
