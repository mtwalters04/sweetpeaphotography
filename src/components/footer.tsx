import Link from 'next/link';
import { STUDIO } from '@/lib/content/studio';

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${STUDIO.url}#studio`,
  name: STUDIO.name,
  url: STUDIO.url,
  email: STUDIO.email,
  telephone: STUDIO.phone,
  priceRange: STUDIO.priceRange,
  description: STUDIO.tagline,
  address: {
    '@type': 'PostalAddress',
    addressLocality: STUDIO.address.locality,
    addressRegion: STUDIO.address.region,
    postalCode: STUDIO.address.postal,
    addressCountry: STUDIO.address.country,
  },
};

export function Footer() {
  return (
    <footer className="border-t border-mist mt-[clamp(96px,12vw,192px)] bg-vellum/40">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Big tagline band */}
      <div className="border-b border-mist">
        <div className="max-w-content mx-auto px-6 py-[clamp(80px,10vw,144px)] grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className="text-ash text-t-12 uppercase tracking-[0.28em] mb-8">{STUDIO.name}</p>
            <p className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-[-0.015em]">
              {STUDIO.tagline.replace('.', '')}
              <span className="text-accent">.</span>
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <Link
              href="/book"
              className="inline-block text-t-12 uppercase tracking-[0.2em] text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-500"
            >
              Begin a booking →
            </Link>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="max-w-content mx-auto px-6 py-20 grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 md:col-span-4">
          <p className="text-ash text-t-12 uppercase tracking-[0.25em] mb-5">Studio</p>
          <p className="font-serif text-t-22 leading-tight">
            <span className="italic font-light">Two photographers, one local market.</span>
          </p>
          <p className="text-ash text-t-14 mt-4 leading-relaxed font-light max-w-prose">
            By appointment. Mondays and Tuesdays reserved for editing.
          </p>
        </div>

        <div className="col-span-6 md:col-span-2 md:col-start-7">
          <p className="text-ash text-t-12 uppercase tracking-[0.25em] mb-5">Visit</p>
          <ul className="space-y-3 text-t-14">
            <li>
              <Link href="/portfolio" className="hover:text-accent transition-colors duration-500">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-accent transition-colors duration-500">
                Services
              </Link>
            </li>
            <li>
              <Link href="/journal" className="hover:text-accent transition-colors duration-500">
                Journal
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent transition-colors duration-500">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-6 md:col-span-2">
          <p className="text-ash text-t-12 uppercase tracking-[0.25em] mb-5">Begin</p>
          <ul className="space-y-3 text-t-14">
            <li>
              <Link href="/book" className="hover:text-accent transition-colors duration-500">
                Book a session
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent transition-colors duration-500">
                Custom request
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-12 md:col-span-2">
          <p className="text-ash text-t-12 uppercase tracking-[0.25em] mb-5">Contact</p>
          <ul className="space-y-3 text-t-14">
            <li>
              <a href={`mailto:${STUDIO.email}`} className="hover:text-accent transition-colors duration-500">
                {STUDIO.email}
              </a>
            </li>
            <li className="text-ash">{STUDIO.phone}</li>
            <li className="text-ash">
              {STUDIO.address.locality}, {STUDIO.address.region}
            </li>
          </ul>
        </div>
      </div>

      {/* Fine print */}
      <div className="border-t border-mist">
        <div className="max-w-content mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-ash text-t-12">
          <span className="uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {STUDIO.name}
          </span>
          <span className="font-serif italic font-light text-t-14">
            Made by hand, in {STUDIO.address.locality}.
          </span>
        </div>
      </div>
    </footer>
  );
}
