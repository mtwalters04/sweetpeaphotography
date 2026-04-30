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
    <footer className="border-t border-mist mt-[clamp(96px,12vw,192px)]">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="max-w-content mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <p className="font-serif text-t-28 leading-tight max-w-prose">{STUDIO.tagline}</p>
          <p className="text-ash text-t-14 mt-6 max-w-prose">
            Portrait and event photography. Two photographers, one studio, one local market.
          </p>
        </div>

        <div>
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-4">Visit</p>
          <ul className="space-y-2 text-t-14">
            <li>
              <Link href="/portfolio" className="hover:text-accent transition-colors">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-accent transition-colors">
                Services
              </Link>
            </li>
            <li>
              <Link href="/journal" className="hover:text-accent transition-colors">
                Journal
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-4">Contact</p>
          <ul className="space-y-2 text-t-14">
            <li>
              <a href={`mailto:${STUDIO.email}`} className="hover:text-accent transition-colors">
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

      <div className="border-t border-mist">
        <div className="max-w-content mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-ash text-t-12">
          <span>
            © {new Date().getFullYear()} {STUDIO.name}. All rights reserved.
          </span>
          <span className="uppercase tracking-[0.2em]">By appointment</span>
        </div>
      </div>
    </footer>
  );
}
