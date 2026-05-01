import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PORTFOLIO, getCollection } from '@/lib/content/portfolio';
import { placeholderSrc } from '@/lib/placeholder';
import { CtaLink } from '@/components/cta-link';

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
      <header className="pt-[clamp(160px,22vw,288px)] pb-[clamp(56px,8vw,112px)]">
        <div className="max-w-content mx-auto px-6">
          <Link
            href="/portfolio"
            className="text-ash text-t-12 uppercase tracking-[0.22em] hover:text-accent transition-colors duration-500"
          >
            ← All collections
          </Link>
          <p className="text-ash text-t-12 uppercase tracking-[0.22em] mt-16 mb-6">
            {collection.eyebrow}
          </p>
          <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.02em]">
            {collection.title.split(' ').map((word, i, arr) =>
              i === arr.length - 1 ? (
                <span key={i} className="italic font-light">
                  {word}
                </span>
              ) : (
                <span key={i}>{word} </span>
              ),
            )}
          </h1>
          <p className="text-t-22 text-ash mt-10 max-w-prose font-light leading-relaxed">
            {collection.summary}
          </p>
        </div>
      </header>

      {/* Cover */}
      <section className="pb-[clamp(56px,8vw,112px)]">
        <div className="max-w-content mx-auto px-6">
          <div className={`relative ${aspectClass(collection.cover.orientation)} bg-mist`}>
            <Image
              src={placeholderSrc(collection.cover.seed, 2200, 1500)}
              alt={collection.cover.alt}
              fill
              priority
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Asymmetric gallery */}
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
              idx % 4 === 1 ? 'md:col-start-6 md:mt-16' : idx % 4 === 3 ? 'md:col-start-4 md:mt-12' : '';
            return (
              <figure key={image.seed} className={`${span} ${offset}`}>
                <div className={`relative ${aspectClass(image.orientation)} bg-mist`}>
                  <Image
                    src={placeholderSrc(image.seed, 1400, 1750)}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                {image.alt && (
                  <figcaption className="mt-3 text-ash text-t-12 italic font-light">
                    {image.alt}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-[clamp(112px,16vw,208px)] border-t border-mist">
        <div className="max-w-content mx-auto px-6 text-center">
          <p className="text-ash text-t-12 uppercase tracking-[0.28em] mb-10">
            Looking for something like this
          </p>
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-tight tracking-[-0.015em] max-w-3xl mx-auto">
            Find a date,
            <span className="italic font-light"> or write us a new one.</span>
          </h2>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            <CtaLink href="/book">See available dates</CtaLink>
            <CtaLink href="/contact">Request a custom date</CtaLink>
          </div>
        </div>
      </section>
    </>
  );
}
