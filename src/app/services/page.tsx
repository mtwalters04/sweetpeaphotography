import Link from 'next/link';
import type { Metadata } from 'next';
import { SERVICES } from '@/lib/content/services';
import { CtaLink } from '@/components/cta-link';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Portrait sessions, weddings, families, and seasonal mini-sessions.',
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function ServicesIndex() {
  return (
    <>
      <section className="pt-[clamp(112px,12vw,156px)] pb-[clamp(88px,10vw,160px)]">
        <ul className="max-w-content mx-auto px-6 divide-y divide-mist border-y border-mist">
          {SERVICES.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="grid grid-cols-12 gap-6 py-9 group items-baseline transition-colors duration-500"
              >
                <div className="col-span-12 md:col-span-1 text-ash text-t-12 uppercase tracking-[0.22em]">
                  {service.eyebrow}
                </div>
                <div className="col-span-12 md:col-span-6 md:col-start-3">
                  <h2 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] leading-tight tracking-[-0.01em] group-hover:text-accent transition-colors duration-500">
                    {service.name}
                  </h2>
                  <p className="text-ash text-t-16 mt-2.5 max-w-prose font-light leading-relaxed">
                    {service.summary}
                  </p>
                </div>
                <div className="col-span-6 md:col-span-2 md:col-start-10 text-t-14 text-ash font-light">
                  {service.durationLabel}
                </div>
                <div className="col-span-6 md:col-span-1 text-right md:text-left">
                  <p className="font-serif text-[clamp(1.5rem,2.2vw,1.875rem)] leading-none">
                    {formatPrice(service.startingAt)}
                  </p>
                  <p className="text-ash text-t-12 mt-1.5 uppercase tracking-[0.18em]">starting</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="max-w-content mx-auto px-6 mt-14 text-center">
          <CtaLink href="/book">See available dates</CtaLink>
        </div>
      </section>
    </>
  );
}
