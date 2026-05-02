import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPortfolioCollection } from '@/lib/content/portfolio';
import { CtaLink } from '@/components/cta-link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getPortfolioCollection(slug);
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
  const collection = await getPortfolioCollection(slug);
  if (!collection) notFound();

  return (
    <>
      {/* Cover */}
      <section className="pt-[clamp(112px,12vw,156px)] pb-[clamp(56px,8vw,112px)]">
        <div className="max-w-content mx-auto px-6">
          <div className="mb-8 md:mb-10 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/portfolio"
              className="text-ash text-t-12 uppercase tracking-[0.22em] hover:text-accent transition-colors duration-500"
            >
              ← All collections
            </Link>
            <p className="text-ash text-t-12 uppercase tracking-[0.22em]">{collection.eyebrow}</p>
          </div>
          <div className={`relative ${aspectClass(collection.cover.orientation)} bg-mist`}>
            <Image
              src={collection.cover.src}
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
              <figure key={image.id} className={`${span} ${offset}`}>
                <div className={`relative ${aspectClass(image.orientation)} bg-mist`}>
                  <Image
                    src={image.src}
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
