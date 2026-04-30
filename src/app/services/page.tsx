import Link from 'next/link';
import type { Metadata } from 'next';
import { SERVICES } from '@/lib/content/services';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Portrait sessions, weddings, families, and seasonal mini-sessions.',
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function ServicesIndex() {
  return (
    <>
      <header className="pt-[clamp(128px,18vw,224px)] pb-[clamp(64px,8vw,128px)]">
        <div className="max-w-content mx-auto px-6">
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-6">Services</p>
          <h1 className="font-serif text-t-48 md:text-t-64 max-w-3xl leading-[1.05]">
            Sittings, sessions, and full-day coverage.
          </h1>
          <p className="text-t-18 text-ash mt-8 max-w-prose">
            A 30% deposit confirms any booking. Need something not on this list? Send a custom
            request and we will quote it.
          </p>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        <ul className="max-w-content mx-auto px-6 divide-y divide-mist border-y border-mist">
          {SERVICES.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="grid grid-cols-12 gap-6 py-10 group items-baseline"
              >
                <div className="col-span-12 md:col-span-1 text-ash text-t-12 uppercase tracking-[0.2em]">
                  {service.eyebrow}
                </div>
                <div className="col-span-12 md:col-span-6 md:col-start-3">
                  <h2 className="font-serif text-t-36 group-hover:text-accent transition-colors">
                    {service.name}
                  </h2>
                  <p className="text-ash text-t-16 mt-3 max-w-prose">{service.summary}</p>
                </div>
                <div className="col-span-6 md:col-span-2 md:col-start-10 text-t-14 text-ash">
                  {service.durationLabel}
                </div>
                <div className="col-span-6 md:col-span-1 text-t-22 font-serif text-right md:text-left">
                  {formatPrice(service.startingAt)}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="max-w-content mx-auto px-6 mt-16 text-center">
          <Link
            href="/book"
            className="inline-block text-t-14 text-bone bg-ink px-6 py-3 hover:bg-accent transition-colors"
          >
            See available dates
          </Link>
        </div>
      </section>
    </>
  );
}
