import Link from 'next/link';
import type { Metadata } from 'next';
import { SERVICES } from '@/lib/content/services';
import { CtaLink } from '@/components/cta-link';
import { SectionEyebrow } from '@/components/section-eyebrow';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Portrait sessions, weddings, families, and seasonal mini-sessions.',
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function ServicesIndex() {
  return (
    <>
      <header className="pt-[clamp(160px,22vw,288px)] pb-[clamp(72px,10vw,144px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-7">
            <SectionEyebrow number="—" label="Services" />
            <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.02em] mt-10">
              Sittings, sessions,
              <br />
              <span className="italic font-light">and full days.</span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="text-ash text-t-16 font-light leading-relaxed max-w-prose">
              A 30% deposit confirms any booking. The remainder is due on the day of the shoot.
              Need something not on this list? Send a custom request and we will quote it.
            </p>
          </div>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        <ul className="max-w-content mx-auto px-6 divide-y divide-mist border-y border-mist">
          {SERVICES.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="grid grid-cols-12 gap-6 py-12 group items-baseline transition-colors duration-500"
              >
                <div className="col-span-12 md:col-span-1 text-ash text-t-12 uppercase tracking-[0.22em]">
                  {service.eyebrow}
                </div>
                <div className="col-span-12 md:col-span-6 md:col-start-3">
                  <h2 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] leading-tight tracking-[-0.01em] group-hover:text-accent transition-colors duration-500">
                    {service.name}
                  </h2>
                  <p className="text-ash text-t-16 mt-3 max-w-prose font-light leading-relaxed">
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

        <div className="max-w-content mx-auto px-6 mt-20 text-center">
          <CtaLink href="/book">See available dates</CtaLink>
        </div>
      </section>
    </>
  );
}
