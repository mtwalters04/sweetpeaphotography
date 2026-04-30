import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PORTFOLIO, getCollection } from '@/lib/content/portfolio';
import { placeholderSrc } from '@/lib/placeholder';

export function generateStaticParams() {
  return PORTFOLIO.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.summary,
  };
}

const aspectClass = (orientation: 'portrait' | 'landscape' | 'square'): string => {
  if (orientation === 'portrait') return 'aspect-[4/5]';
  if (orientation === 'landscape') return 'aspect-[3/2]';
  return 'aspect-square';
};

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  return (
    <>
      <header className="pt-[clamp(128px,18vw,224px)] pb-[clamp(48px,6vw,96px)]">
        <div className="max-w-content mx-auto px-6">
          <Link
            href="/portfolio"
            className="text-ash text-t-12 uppercase tracking-[0.2em] hover:text-accent transition-colors"
          >
            ← All collections
          </Link>
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mt-12 mb-6">
            {collection.eyebrow}
          </p>
          <h1 className="font-serif text-t-48 md:text-t-64 leading-[1.05]">{collection.title}</h1>
          <p className="text-t-18 text-ash mt-8 max-w-prose">{collection.summary}</p>
        </div>
      </header>

      {/* Cover */}
      <section className="pb-[clamp(48px,6vw,96px)]">
        <div className="max-w-content mx-auto px-6">
          <div className={`relative ${aspectClass(collection.cover.orientation)} bg-mist`}>
            <Image
              src={placeholderSrc(collection.cover.seed, 1800, 1200)}
              alt={collection.cover.alt}
              fill
              priority
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Gallery — asymmetric grid */}
      <section className="pb-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6">
          {collection.images.map((image, idx) => {
            const span =
              image.orientation === 'landscape'
                ? 'col-span-12 md:col-span-8'
                : image.orientation === 'square'
                  ? 'col-span-12 md:col-span-6'
                  : 'col-span-12 md:col-span-5';
            const offset =
              idx % 4 === 1 ? 'md:col-start-6' : idx % 4 === 3 ? 'md:col-start-4' : '';
            return (
              <figure key={image.seed} className={`${span} ${offset}`}>
                <div className={`relative ${aspectClass(image.orientation)} bg-mist`}>
                  <Image
                    src={placeholderSrc(image.seed, 1200, 1500)}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </figure>
            );
          })}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-[clamp(64px,8vw,128px)] border-t border-mist">
        <div className="max-w-content mx-auto px-6 text-center">
          <p className="font-serif text-t-36 max-w-prose mx-auto leading-tight">
            Looking for something like this?
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/book"
              className="text-t-14 text-bone bg-ink px-6 py-3 hover:bg-accent transition-colors"
            >
              See available dates
            </Link>
            <Link
              href="/contact"
              className="text-t-14 underline underline-offset-4 hover:text-accent transition-colors"
            >
              Request a custom date
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
