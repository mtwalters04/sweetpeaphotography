import Image from 'next/image';
import Link from 'next/link';
import { PORTFOLIO } from '@/lib/content/portfolio';
import { SERVICES } from '@/lib/content/services';
import { TESTIMONIALS } from '@/lib/content/testimonials';
import { STUDIO } from '@/lib/content/studio';
import { placeholderSrc } from '@/lib/placeholder';
import { CtaLink } from '@/components/cta-link';
import { SectionEyebrow } from '@/components/section-eyebrow';

const featured = PORTFOLIO.slice(0, 5);
const featuredTestimonial = TESTIMONIALS[0]!;
const featuredServices = SERVICES.slice(0, 4);

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <Image
          src={placeholderSrc('hero-home', 2200, 1400)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink/10 via-transparent to-ink/55"
        />
        <div className="relative z-10 h-full max-w-content mx-auto px-6 flex flex-col">
          <div className="flex-1" />
          <div className="pb-[clamp(72px,11vw,160px)]">
            <p className="text-bone/85 text-t-12 uppercase tracking-[0.28em] mb-8 font-light">
              {STUDIO.name} · est. quietly
            </p>
            <h1 className="font-serif text-bone text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.98] tracking-[-0.02em] max-w-5xl">
              Heirlooms,
              <br />
              <span className="italic font-light">in modern light.</span>
            </h1>
            <p className="text-bone/75 text-t-18 mt-10 max-w-prose font-light leading-relaxed">
              Portrait and event photography for people who want the photographs to outlast the
              party. Booking now for late spring through autumn.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-x-12 gap-y-6">
              <CtaLink href="/book" variant="on-image">
                See available dates
              </CtaLink>
              <CtaLink href="/contact" variant="on-image">
                Request a custom date
              </CtaLink>
            </div>
          </div>
          <div className="pb-6 text-bone/60 text-t-12 uppercase tracking-[0.3em] hidden md:block">
            Scroll
          </div>
        </div>
      </section>

      {/* PORTFOLIO — proof, immediately */}
      <section className="pt-[clamp(96px,12vw,160px)] pb-[clamp(96px,12vw,176px)]">
        <div className="max-w-content mx-auto px-6 mb-20 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-7">
            <SectionEyebrow number="01" label="Recent work" />
            <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.015em] mt-8">
              The work, <span className="italic font-light">first.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9 md:text-right">
            <CtaLink href="/portfolio" variant="primary">
              All collections
            </CtaLink>
          </div>
        </div>

        {/* Editorial mosaic — five collections, asymmetric */}
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-x-6 gap-y-[clamp(48px,6vw,96px)]">
          <PortfolioCard
            collection={featured[0]!}
            spanClass="col-span-12 md:col-span-7"
            offsetClass=""
            aspect="aspect-[4/5]"
            sizes="(min-width: 768px) 58vw, 100vw"
          />
          <PortfolioCard
            collection={featured[1]!}
            spanClass="col-span-12 md:col-span-4"
            offsetClass="md:col-start-9 md:mt-32"
            aspect="aspect-[4/5]"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <PortfolioCard
            collection={featured[2]!}
            spanClass="col-span-12 md:col-span-5"
            offsetClass="md:col-start-2"
            aspect="aspect-[3/4]"
            sizes="(min-width: 768px) 42vw, 100vw"
          />
          <PortfolioCard
            collection={featured[3]!}
            spanClass="col-span-12 md:col-span-6"
            offsetClass="md:col-start-7 md:mt-24"
            aspect="aspect-[4/3]"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <PortfolioCard
            collection={featured[4]!}
            spanClass="col-span-12 md:col-span-8"
            offsetClass="md:col-start-3"
            aspect="aspect-[3/2]"
            sizes="(min-width: 768px) 66vw, 100vw"
          />
        </div>
      </section>

      {/* STUDIO */}
      <section className="py-[clamp(96px,14vw,200px)] border-t border-mist">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-3">
            <SectionEyebrow number="02" label="The studio" />
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-5">
            <p className="font-serif text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.25] max-w-prose">
              Two photographers, working together.{' '}
              <span className="italic font-light">Quietly, patiently,</span> in the kind of light
              that makes a Tuesday afternoon feel like an heirloom.
            </p>
            <p className="text-t-18 text-ash mt-10 max-w-prose font-light leading-relaxed">
              We photograph weddings, portraits, and the occasional family that keeps coming back.
              A small studio in a single local market. Travel by request.
            </p>
            <div className="mt-12">
              <CtaLink href="/about">More about the studio</CtaLink>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE SHOOT */}
      <section className="py-[clamp(96px,14vw,200px)] border-t border-mist">
        <div className="max-w-content mx-auto px-6 mb-16">
          <SectionEyebrow number="03" label="What we shoot" />
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.015em] mt-8 max-w-3xl">
            Sittings, sessions, <span className="italic font-light">and full days.</span>
          </h2>
        </div>

        <ul className="max-w-content mx-auto px-6 divide-y divide-mist border-y border-mist">
          {featuredServices.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="grid grid-cols-12 gap-6 py-8 group items-baseline transition-colors duration-500"
              >
                <div className="col-span-12 md:col-span-1 text-ash text-t-12 uppercase tracking-[0.2em]">
                  {service.eyebrow}
                </div>
                <div className="col-span-12 md:col-span-7 md:col-start-3">
                  <h3 className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight group-hover:text-accent transition-colors duration-500">
                    {service.name}
                  </h3>
                  <p className="text-t-16 text-ash mt-2 max-w-prose font-light">
                    {service.summary}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-2 md:col-start-11 md:text-right">
                  <p className="font-serif text-t-22 leading-none">
                    {formatPrice(service.startingAt)}
                  </p>
                  <p className="text-ash text-t-12 mt-1 uppercase tracking-[0.15em]">starting</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="max-w-content mx-auto px-6 mt-12">
          <CtaLink href="/services">All services and pricing</CtaLink>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-[clamp(120px,16vw,224px)] border-t border-mist bg-mist/30">
        <div className="max-w-content mx-auto px-6">
          <div className="text-center mb-16">
            <SectionEyebrow number="04" label="From a recent client" />
          </div>
          <blockquote className="font-serif text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.3] max-w-4xl mx-auto text-center tracking-[-0.005em]">
            <span className="font-light italic text-ink/60">“</span>
            {featuredTestimonial.quote}
            <span className="font-light italic text-ink/60">”</span>
          </blockquote>
          <p className="text-t-12 uppercase tracking-[0.25em] text-ash mt-12 text-center">
            <span className="font-serif italic normal-case text-ash text-t-16 mr-3">—</span>
            {featuredTestimonial.attribution}
            <span className="text-ash/60 mx-3">·</span>
            {featuredTestimonial.context}
          </p>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="py-[clamp(120px,18vw,256px)] border-t border-mist">
        <div className="max-w-content mx-auto px-6 text-center">
          <p className="text-ash text-t-12 uppercase tracking-[0.28em] mb-10">Ready when you are</p>
          <h2 className="font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.02em] max-w-4xl mx-auto">
            Find a date,
            <br />
            <span className="italic font-light">or write us a new one.</span>
          </h2>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            <CtaLink href="/book" variant="primary">
              See available dates
            </CtaLink>
            <CtaLink href="/contact" variant="primary">
              Request a custom date
            </CtaLink>
          </div>
          <p className="text-ash text-t-14 mt-12 max-w-prose mx-auto font-light">
            A 30% deposit confirms the booking. The remainder is due on the day of the shoot.
          </p>
        </div>
      </section>
    </>
  );
}

function PortfolioCard({
  collection,
  spanClass,
  offsetClass,
  aspect,
  sizes,
}: {
  collection: (typeof PORTFOLIO)[number];
  spanClass: string;
  offsetClass: string;
  aspect: string;
  sizes: string;
}) {
  return (
    <Link
      href={`/portfolio/${collection.slug}`}
      className={`block group ${spanClass} ${offsetClass}`}
    >
      <div className={`relative ${aspect} bg-mist overflow-hidden`}>
        <Image
          src={placeholderSrc(collection.cover.seed, 1400, 1750)}
          alt={collection.cover.alt}
          fill
          sizes={sizes}
          className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.015]"
        />
      </div>
      <div className="mt-6 flex items-baseline justify-between gap-6">
        <div>
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-2">
            {collection.eyebrow}
          </p>
          <h3 className="font-serif text-[clamp(1.4rem,2vw,1.85rem)] leading-tight group-hover:text-accent transition-colors duration-500">
            {collection.title}
          </h3>
        </div>
        <span
          aria-hidden
          className="text-ash text-t-22 leading-none transform transition-transform duration-500 group-hover:translate-x-1 group-hover:text-accent"
        >
          →
        </span>
      </div>
    </Link>
  );
}
