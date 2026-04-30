import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SERVICES, getService } from '@/lib/content/services';
import { placeholderSrc } from '@/lib/placeholder';

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
      <header className="pt-[clamp(128px,18vw,224px)] pb-[clamp(48px,6vw,96px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-7">
            <Link
              href="/services"
              className="text-ash text-t-12 uppercase tracking-[0.2em] hover:text-accent transition-colors"
            >
              ← All services
            </Link>
            <p className="text-ash text-t-12 uppercase tracking-[0.2em] mt-12 mb-6">
              {service.eyebrow}
            </p>
            <h1 className="font-serif text-t-48 md:text-t-64 leading-[1.05]">{service.name}</h1>
            <p className="text-t-22 text-ash mt-8 max-w-prose">{service.summary}</p>
          </div>
        </div>
      </header>

      {/* Hero image */}
      <section className="pb-[clamp(64px,8vw,128px)]">
        <div className="max-w-content mx-auto px-6">
          <div className="relative aspect-[3/2] bg-mist">
            <Image
              src={placeholderSrc(`service-${service.slug}`, 1800, 1200)}
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
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-7">
            <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-6">The session</p>
            <p className="text-t-22 leading-[1.5] max-w-prose">{service.description}</p>
          </div>
          <aside className="col-span-12 md:col-span-4 md:col-start-9 border-t border-mist pt-8 md:border-t-0 md:border-l md:pl-10 md:pt-0">
            <p className="text-ash text-t-12 uppercase tracking-[0.2em]">Starting at</p>
            <p className="font-serif text-t-48 leading-tight mt-2">
              {formatPrice(service.startingAt)}
            </p>
            <p className="text-ash text-t-14 mt-2">{service.durationLabel}</p>

            <p className="text-ash text-t-12 uppercase tracking-[0.2em] mt-10 mb-4">Includes</p>
            <ul className="space-y-3 text-t-14">
              {service.includes.map((item) => (
                <li key={item} className="border-b border-mist pb-3">
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/book"
              className="block text-center mt-10 text-t-14 text-bone bg-ink px-6 py-3 hover:bg-accent transition-colors"
            >
              See available dates
            </Link>
            <Link
              href="/contact"
              className="block text-center mt-3 text-t-14 underline underline-offset-4 hover:text-accent transition-colors"
            >
              Request a custom date
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
