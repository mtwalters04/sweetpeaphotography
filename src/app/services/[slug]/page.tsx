import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SERVICES, getService } from '@/lib/content/services';
import { placeholderSrc } from '@/lib/placeholder';
import { CtaLink } from '@/components/cta-link';

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return { title: service.name, description: service.summary };
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <header className="pt-[clamp(160px,22vw,288px)] pb-[clamp(56px,8vw,112px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8">
            <Link
              href="/services"
              className="text-ash text-t-12 uppercase tracking-[0.22em] hover:text-accent transition-colors duration-500"
            >
              ← All services
            </Link>
            <p className="text-ash text-t-12 uppercase tracking-[0.22em] mt-16 mb-6">
              {service.eyebrow}
            </p>
            <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.02em]">
              {service.name}
            </h1>
            <p className="text-t-22 text-ash mt-10 max-w-prose font-light leading-relaxed">
              {service.summary}
            </p>
          </div>
        </div>
      </header>

      {/* Hero image */}
      <section className="pb-[clamp(72px,10vw,144px)]">
        <div className="max-w-content mx-auto px-6">
          <div className="relative aspect-[3/2] bg-mist">
            <Image
              src={placeholderSrc(`service-${service.slug}`, 2200, 1500)}
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Description + includes */}
      <section className="pb-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-12">
          <div className="col-span-12 md:col-span-7">
            <p className="text-ash text-t-12 uppercase tracking-[0.22em] mb-8">The session</p>
            <p className="font-serif text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.4] max-w-prose">
              {service.description}
            </p>
          </div>
          <aside className="col-span-12 md:col-span-4 md:col-start-9 border-t border-mist pt-10 md:border-t-0 md:border-l md:pl-10 md:pt-0">
            <p className="text-ash text-t-12 uppercase tracking-[0.22em]">Starting at</p>
            <p className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-none mt-3 tracking-[-0.02em]">
              {formatPrice(service.startingAt)}
            </p>
            <p className="text-ash text-t-14 mt-3 font-light italic">{service.durationLabel}</p>

            <p className="text-ash text-t-12 uppercase tracking-[0.22em] mt-12 mb-5">Included</p>
            <ul className="space-y-0 text-t-14 font-light">
              {service.includes.map((item) => (
                <li key={item} className="border-b border-mist py-3">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-col gap-4">
              <CtaLink href="/book">See available dates</CtaLink>
              <CtaLink href="/contact" variant="secondary">
                Request a custom date
              </CtaLink>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
