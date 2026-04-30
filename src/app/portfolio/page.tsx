import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PORTFOLIO } from '@/lib/content/portfolio';
import { placeholderSrc } from '@/lib/placeholder';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Selected work from Sweet Pea Photography — weddings, portraits, families.',
};

export default function PortfolioIndex() {
  return (
    <>
      <header className="pt-[clamp(128px,18vw,224px)] pb-[clamp(64px,8vw,128px)]">
        <div className="max-w-content mx-auto px-6">
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-6">Portfolio</p>
          <h1 className="font-serif text-t-48 md:text-t-64 max-w-3xl leading-[1.05]">
            Collections from the studio.
          </h1>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        <ul className="space-y-[clamp(64px,8vw,128px)]">
          {PORTFOLIO.map((collection, idx) => (
            <li key={collection.slug}>
              <Link href={`/portfolio/${collection.slug}`} className="block group">
                <div
                  className={`max-w-content mx-auto px-6 grid grid-cols-12 gap-6 items-end ${
                    idx % 2 === 1 ? 'md:[direction:rtl]' : ''
                  }`}
                >
                  <div className="col-span-12 md:col-span-7 [direction:ltr]">
                    <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden bg-mist">
                      <Image
                        src={placeholderSrc(collection.cover.seed, 1200, 1500)}
                        alt={collection.cover.alt}
                        fill
                        sizes="(min-width: 768px) 58vw, 100vw"
                        className="object-cover transition-opacity duration-700 group-hover:opacity-90"
                      />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4 md:col-start-9 [direction:ltr] pb-4">
                    <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-3">
                      {collection.eyebrow}
                    </p>
                    <h2 className="font-serif text-t-36 group-hover:text-accent transition-colors">
                      {collection.title}
                    </h2>
                    <p className="text-ash text-t-16 mt-4 max-w-prose">{collection.summary}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
