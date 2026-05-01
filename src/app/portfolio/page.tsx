import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PORTFOLIO } from '@/lib/content/portfolio';
import { placeholderSrc } from '@/lib/placeholder';
import { CtaLink } from '@/components/cta-link';
import { SectionEyebrow } from '@/components/section-eyebrow';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Selected work from Sweet Pea Photography — weddings, portraits, families.',
};

export default function PortfolioIndex() {
  return (
    <>
      <header className="pt-[clamp(160px,22vw,288px)] pb-[clamp(72px,10vw,144px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-7">
            <SectionEyebrow number="—" label="Portfolio" />
            <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.02em] mt-10">
              Collections
              <br />
              <span className="italic font-light">from the studio.</span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9 md:text-right">
            <p className="text-ash text-t-16 font-light leading-relaxed max-w-prose md:ml-auto">
              A handful at a time. Most of what we shoot stays with the family. These are the ones
              the family let us share.
            </p>
          </div>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        <ul className="space-y-[clamp(80px,10vw,160px)]">
          {PORTFOLIO.map((collection, idx) => (
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
                        src={placeholderSrc(collection.cover.seed, 1400, 1750)}
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
