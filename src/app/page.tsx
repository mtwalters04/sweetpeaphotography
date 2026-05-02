import Image from 'next/image';
import Link from 'next/link';
import { getPortfolioCollections, type PortfolioCollection } from '@/lib/content/portfolio';
import { SERVICES } from '@/lib/content/services';
import { TESTIMONIALS } from '@/lib/content/testimonials';
import { STUDIO } from '@/lib/content/studio';
import { CtaLink } from '@/components/cta-link';
import { SectionEyebrow } from '@/components/section-eyebrow';
import { TestimonialCarousel } from '@/components/testimonial-carousel';

const featuredServices = SERVICES.slice(0, 4);

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default async function Home() {
  const featured = (await getPortfolioCollections()).slice(0, 6);
  return (
    <>
      {/* HERO — desktop: text panel + right-side image blend for readability */}
      <section className="relative min-h-[96svh] w-full overflow-hidden bg-bone">
        <Image
          src="/images/hero-home-estate.jpg"
          alt="Historic riverside estate at golden hour with moss-draped oaks and a columned porch"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[40%_center] md:object-right"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/5 to-ink/65 md:hidden"
        />
        <div
          aria-hidden
          className="hidden md:block absolute inset-0 bg-[linear-gradient(90deg,rgba(243,238,232,0.95)_0%,rgba(243,238,232,0.9)_10%,rgba(243,238,232,0.8)_22%,rgba(243,238,232,0.62)_36%,rgba(243,238,232,0.38)_49%,rgba(243,238,232,0.16)_61%,rgba(243,238,232,0.06)_69%,rgba(243,238,232,0)_78%)]"
        />
        <div
          aria-hidden
          className="hidden md:block absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bone/70 via-bone/38 to-transparent"
        />
        <div
          aria-hidden
          className="hidden md:block absolute inset-x-0 bottom-0 h-[28vh] bg-gradient-to-b from-transparent via-bone/65 to-bone"
        />
        <div className="relative z-10 h-full min-h-[96svh] px-6 md:px-[clamp(40px,6vw,108px)] flex flex-col">
          <div className="flex-1 min-h-[16svh] md:min-h-[14svh]" />
          <div className="pb-[clamp(42px,7vw,96px)] md:max-w-[56rem]">
            <div className="rounded-sm bg-bone/18 backdrop-blur-[1.5px] px-4 py-4 md:bg-transparent md:backdrop-blur-0 md:px-0 md:py-0">
            <p className="text-bone/95 md:text-ash/95 text-t-12 mb-8 font-normal eyebrow-label">
              {STUDIO.name} · est. quietly
            </p>
            <h1 className="font-serif text-bone md:text-ink text-[clamp(3.1rem,7.5vw,6.1rem)] leading-[0.98] tracking-[-0.02em] max-w-5xl text-wrap-balance [text-shadow:0_1px_12px_rgba(24,22,20,0.22)] md:[text-shadow:none]">
              Heirlooms,
              <br />
              <span className="italic font-light">in modern light.</span>
            </h1>
            <p className="text-bone/95 md:text-ash text-[1.18rem] mt-9 max-w-prose font-medium leading-relaxed text-wrap-pretty [text-shadow:0_1px_10px_rgba(24,22,20,0.18)] md:[text-shadow:none]">
              Portrait and event photography for people who want the photographs to outlast the
              party. Booking now for late spring through autumn.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-x-12 gap-y-6 md:hidden">
              <CtaLink href="/book" variant="on-image">
                See available dates
              </CtaLink>
              <CtaLink href="/contact" variant="on-image">
                Request a custom date
              </CtaLink>
            </div>
            <div className="mt-12 hidden md:flex flex-wrap items-center gap-x-12 gap-y-6">
              <CtaLink href="/book" variant="primary">
                See available dates
              </CtaLink>
              <CtaLink href="/contact" variant="primary">
                Request a custom date
              </CtaLink>
            </div>

            </div>

            <div className="mt-10 border border-mist/80 bg-bone/86 backdrop-blur-[2px] p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-4">
                  <p className="text-t-12 text-ash/95 eyebrow-label mb-3">Start here</p>
                  <h2 className="font-serif text-[clamp(1.45rem,2.7vw,2.2rem)] leading-[1.15] text-wrap-balance">
                    Choose your path,
                    <br />
                    <span className="italic font-light">book in minutes.</span>
                  </h2>
                </div>
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <article className="border border-mist bg-bone p-5 md:p-6 min-h-[220px] flex flex-col">
                    <p className="text-t-12 text-ash/90 eyebrow-label mb-3">Fast route</p>
                    <p className="font-serif text-[clamp(1.18rem,1.55vw,1.38rem)] leading-tight min-h-[2.2em]">
                      Book open dates
                    </p>
                    <p className="text-t-16 text-ash/95 mt-4 leading-relaxed text-wrap-pretty">
                      Choose a published slot, place the deposit, and your date is confirmed.
                    </p>
                  </article>
                  <article className="border border-mist bg-bone p-5 md:p-6 min-h-[220px] flex flex-col">
                    <p className="text-t-12 text-ash/90 eyebrow-label mb-3">Need flexibility</p>
                    <p className="font-serif text-[clamp(1.18rem,1.55vw,1.38rem)] leading-tight min-h-[2.2em] md:whitespace-nowrap">
                      Custom date request
                    </p>
                    <p className="text-t-16 text-ash/95 mt-4 leading-relaxed text-wrap-pretty">
                      Share your timing and session details, and we will send a tailored quote.
                    </p>
                  </article>
                </div>
              </div>
            </div>
          </div>
          <div className="pb-6 text-bone/55 md:text-ash/75 text-t-12 eyebrow-label">Scroll</div>
        </div>
      </section>

      {/* PORTFOLIO — primary sales surface: work, social proof, and booking paths in one band */}
      <section className="pt-[clamp(72px,10vw,140px)] pb-[clamp(96px,12vw,176px)]">
        <div className="max-w-content mx-auto px-6 mb-16 md:mb-20 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-8">
            <SectionEyebrow number="01" label="Recent work" />
            <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.015em] mt-8 max-w-3xl text-wrap-balance">
              The work up front — <span className="italic font-light">then the calendar.</span>
            </h2>
            <p className="text-t-16 text-ash mt-6 max-w-prose font-light leading-relaxed text-wrap-pretty">
              Explore recent collections, then choose a date that matches your pace. We confirm
              every booking with a simple deposit.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-3 lg:col-start-10 lg:text-right flex flex-wrap gap-x-10 gap-y-4 items-center lg:justify-end">
            <CtaLink href="/portfolio" variant="primary">
              All collections
            </CtaLink>
          </div>
        </div>

        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-x-6 gap-y-[clamp(40px,5vw,88px)]">
          {featured.map((collection, idx) => (
            <PortfolioCard
              key={collection.id}
              collection={collection}
              spanClass={
                idx % 3 === 0
                  ? 'col-span-12 md:col-span-7'
                  : idx % 3 === 1
                    ? 'col-span-12 md:col-span-5'
                    : 'col-span-12 md:col-span-6'
              }
              offsetClass={idx % 4 === 1 ? 'md:mt-12' : idx % 4 === 3 ? 'md:mt-20' : ''}
              aspect={
                collection.cover.orientation === 'portrait'
                  ? 'aspect-[4/5]'
                  : collection.cover.orientation === 'square'
                    ? 'aspect-square'
                    : 'aspect-[3/2]'
              }
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
            />
          ))}

          <aside className="col-span-12 lg:col-span-4 lg:col-start-9 flex flex-col gap-6">
            <TestimonialCarousel testimonials={TESTIMONIALS} />
            <div className="border border-mist bg-vellum/35 p-6 md:p-7">
              <p className="text-ash text-t-12 eyebrow-label mb-4">Ready to begin</p>
              <div className="flex flex-col gap-4">
                <CtaLink href="/book">See available dates</CtaLink>
                <CtaLink href="/contact" variant="secondary">
                  Request a custom date
                </CtaLink>
              </div>
            </div>
          </aside>
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

      {/* CLOSING CTA */}
      <section className="py-[clamp(120px,18vw,256px)] border-t border-mist">
        <div className="max-w-content mx-auto px-6 text-center">
          <p className="text-ash text-t-12 eyebrow-label mb-10">Ready when you are</p>
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
  collection: PortfolioCollection;
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
          src={collection.cover.src}
          alt={collection.cover.alt}
          fill
          sizes={sizes}
          className="object-cover transition-opacity duration-500 ease-out group-hover:opacity-95"
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
          className="text-ash text-t-22 leading-none transition-colors duration-500 group-hover:text-accent"
        >
          →
        </span>
      </div>
    </Link>
  );
}
