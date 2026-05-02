import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPortfolioCollections } from '@/lib/content/portfolio';
import { CtaLink } from '@/components/cta-link';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Selected work from Sweet Pea Photography — weddings, portraits, families.',
};

export default async function PortfolioIndex() {
  const collections = await getPortfolioCollections();
  return (
    <>
      <section className="pt-[clamp(112px,12vw,156px)] pb-[clamp(96px,12vw,192px)]">
        <ul className="space-y-[clamp(80px,10vw,160px)]">
          {collections.map((collection, idx) => (
            <li key={collection.slug}>
              <Link href={`/portfolio/${collection.slug}`} className="block group">
                <div
                  className={`max-w-content mx-auto px-6 grid grid-cols-12 gap-6 items-end ${
                    idx % 2 === 1 ? 'md:[direction:rtl]' : ''
                  }`}
                >
                  <div className="col-span-12 md:col-span-8 [direction:ltr]">
                    <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden bg-mist">
                      <Image
                        src={collection.cover.src}
                        alt={collection.cover.alt}
                        fill
                        sizes="(min-width: 768px) 66vw, 100vw"
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.015]"
                      />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3 md:col-start-10 [direction:ltr] pb-4">
                    <p className="text-ash text-t-12 uppercase tracking-[0.22em] mb-4">
                      {collection.eyebrow}
                    </p>
                    <h2 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] leading-tight tracking-[-0.01em] group-hover:text-accent transition-colors duration-500">
                      {collection.title}
                    </h2>
                    <p className="text-ash text-t-16 mt-5 max-w-prose font-light leading-relaxed">
                      {collection.summary}
                    </p>
                    <p className="mt-8 text-ash text-t-12 uppercase tracking-[0.22em] flex items-center gap-3 group-hover:text-accent transition-colors duration-500">
                      View collection
                      <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {collections.length === 0 && (
          <div className="max-w-content mx-auto px-6 text-center py-20 border-y border-mist">
            <p className="text-t-22 text-ash">Portfolio coming soon.</p>
          </div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="py-[clamp(120px,18vw,224px)] border-t border-mist">
        <div className="max-w-content mx-auto px-6 text-center">
          <p className="text-ash text-t-12 uppercase tracking-[0.28em] mb-10">Like what you see</p>
          <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.02em] max-w-3xl mx-auto">
            Let's make
            <br />
            <span className="italic font-light">your own.</span>
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
