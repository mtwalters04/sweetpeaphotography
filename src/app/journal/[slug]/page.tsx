import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Markdown } from '@/components/markdown';
import { readingTimeLabel } from '@/lib/reading-time';
import { placeholderSrc } from '@/lib/placeholder';
import { STUDIO } from '@/lib/content/studio';
import { getService } from '@/lib/content/services';

export const revalidate = 60;

async function loadPost(slug: string) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return {};
  const title = post.meta_title ?? post.title;
  const description = post.meta_description ?? post.dek ?? undefined;
  return {
    title,
    description,
    alternates: post.canonical_url ? { canonical: post.canonical_url } : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: post.hero_image_url ? [{ url: post.hero_image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const heroSrc = post.hero_image_url || placeholderSrc(`journal-${post.slug}`, 1800, 1200);
  const updatedLater =
    post.published_at &&
    new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 24 * 3600 * 1000;
  const relatedService = post.related_service_slug ? getService(post.related_service_slug) : undefined;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.dek ?? undefined,
    image: post.hero_image_url || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: STUDIO.name },
    publisher: {
      '@type': 'Organization',
      name: STUDIO.name,
      url: STUDIO.url,
    },
    mainEntityOfPage: `${STUDIO.url}/journal/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article>
        <header className="pt-[clamp(112px,12vw,156px)] pb-[clamp(24px,4vw,40px)]">
          <div className="max-w-content mx-auto px-6">
            <Link
              href="/journal"
              className="text-ash text-t-12 uppercase tracking-[0.2em] hover:text-accent transition-colors"
            >
              ← Journal
            </Link>
            <p className="text-ash text-t-12 uppercase tracking-[0.2em] mt-12 mb-6">
              {fmt(post.published_at)} · {readingTimeLabel(post.body_md)}
              {updatedLater && (
                <span className="ml-3">Updated {fmt(post.updated_at)}</span>
              )}
            </p>
            <h1 className="font-serif text-t-48 md:text-t-64 leading-[1.05] max-w-4xl">
              {post.title}
            </h1>
            {post.dek && (
              <p className="text-t-22 text-ash mt-8 max-w-prose">{post.dek}</p>
            )}
          </div>
        </header>

        <section className="pb-[clamp(48px,6vw,96px)]">
          <div className="max-w-content mx-auto px-6">
            <div className="relative aspect-[3/2] bg-mist overflow-hidden">
              <Image
                src={heroSrc}
                alt={post.hero_image_alt ?? ''}
                fill
                priority
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="pb-[clamp(96px,12vw,192px)]">
          <div className="max-w-content mx-auto px-6">
            <div className="max-w-prose mx-auto">
              <Markdown source={post.body_md} />
            </div>
          </div>
        </section>

        {(relatedService || post.tags.length > 0) && (
          <section className="pb-[clamp(96px,12vw,192px)] border-t border-mist pt-16">
            <div className="max-w-content mx-auto px-6 max-w-prose mx-auto">
              {relatedService && (
                <div className="mb-12">
                  <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-3">
                    Related service
                  </p>
                  <Link
                    href={`/services/${relatedService.slug}`}
                    className="font-serif text-t-28 hover:text-accent transition-colors"
                  >
                    {relatedService.name} →
                  </Link>
                  <p className="text-ash text-t-16 mt-2">{relatedService.summary}</p>
                </div>
              )}
              {post.tags.length > 0 && (
                <div>
                  <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-3">Filed under</p>
                  <ul className="flex flex-wrap gap-3">
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <Link
                          href={`/journal/tag/${encodeURIComponent(tag)}`}
                          className="text-t-14 border border-mist px-3 py-1 hover:border-ink transition-colors"
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
