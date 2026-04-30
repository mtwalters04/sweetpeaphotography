import Image from 'next/image';
import Link from 'next/link';
import { PORTFOLIO } from '@/lib/content/portfolio';
import { TESTIMONIALS } from '@/lib/content/testimonials';
import { STUDIO } from '@/lib/content/studio';
import { placeholderSrc } from '@/lib/placeholder';

const featuredCollections = PORTFOLIO.slice(0, 3);
const featuredTestimonial = TESTIMONIALS[0]!;

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden">
        <Image
          src={placeholderSrc('hero-home', 1920, 1280)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/0 to-ink/40"
        />
        <div className="relative z-10 h-full max-w-content mx-auto px-6 flex flex-col justify-end pb-[clamp(64px,10vw,128px)]">
          <p className="text-bone/80 text-t-12 uppercase tracking-[0.2em] mb-4">{STUDIO.name}</p>
          <h1 className="font-serif text-bone text-t-48 md:text-t-64 max-w-3xl leading-[1.05]">
            {STUDIO.tagline}
          </h1>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/book"
              className="text-t-14 text-ink bg-bone px-6 py-3 hover:bg-accent hover:text-bone transition-colors"
            >
              See available dates
            </Link>
            <Link
              href="/portfolio"
              className="text-t-14 text-bone underline underline-offset-4 hover:text-accent transition-colors"
            >
              View the work
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          <p className="md:col-span-3 text-ash text-t-12 uppercase tracking-[0.2em]">
            The studio
          </p>
          <div className="md:col-span-8 md:col-start-5">
            <p className="font-serif text-t-36 leading-[1.2] max-w-prose">
              We are two photographers, working together. Quietly, patiently, in the kind of light
              that makes a Tuesday afternoon look like an heirloom.
            </p>
            <p className="text-t-18 text-ash mt-8 max-w-prose">
              Sweet Pea is a small studio for portraits, weddings, and the occasional family that
              keeps coming back. We work in a single local market and travel by request.
            </p>
            <Link
              href="/about"
              className="inline-block mt-10 text-t-14 underline underline-offset-4 hover:text-accent transition-colors"
            >
              About the studio
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio tease — three rows */}
      <section className="py-[clamp(64px,8vw,128px)]">
        <div className="max-w-content mx-auto px-6 mb-16 flex items-end justify-between gap-6">
          <div>
            <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-4">Recent work</p>
            <h2 className="font-serif text-t-36 leading-tight">A few selections.</h2>
          </div>
          <Link
            href="/portfolio"
            className="text-t-14 underline underline-offset-4 hover:text-accent transition-colors whitespace-nowrap"
          >
            All collections
          </Link>
        </div>

        <div className="space-y-[clamp(64px,8vw,128px)]">
          {featuredCollections.map((collection, idx) => (
            <Link
              key={collection.slug}
              href={`/portfolio/${collection.slug}`}
              className="block group"
            >
              <div
                className={`max-w-content mx-auto px-6 grid grid-cols-12 gap-6 items-end ${
                  idx % 2 === 1 ? 'md:[direction:rtl]' : ''
                }`}
              >
                <div className="col-span-12 md:col-span-8 [direction:ltr]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-mist">
                    <Image
                      src={placeholderSrc(collection.cover.seed, 1600, 1200)}
                      alt={collection.cover.alt}
                      fill
                      sizes="(min-width: 768px) 66vw, 100vw"
                      className="object-cover transition-opacity duration-700 group-hover:opacity-90"
                    />
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4 [direction:ltr] pb-2">
                  <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-3">
                    {collection.eyebrow}
                  </p>
                  <h3 className="font-serif text-t-28 group-hover:text-accent transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-ash text-t-14 mt-3 max-w-prose">{collection.summary}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-[clamp(96px,12vw,192px)] bg-mist/40">
        <div className="max-w-content mx-auto px-6">
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-10 text-center">
            From a recent client
          </p>
          <blockquote className="font-serif text-t-36 leading-[1.3] max-w-3xl mx-auto text-center">
            “{featuredTestimonial.quote}”
          </blockquote>
          <p className="text-t-12 uppercase tracking-[0.2em] text-ash mt-10 text-center">
            {featuredTestimonial.attribution} · {featuredTestimonial.context}
          </p>
        </div>
      </section>

      {/* Pricing tease */}
      <section className="py-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          <p className="md:col-span-3 text-ash text-t-12 uppercase tracking-[0.2em]">Investment</p>
          <div className="md:col-span-8 md:col-start-5">
            <p className="font-serif text-t-48 leading-tight">
              Sessions starting at ${STUDIO.startingAt}.
            </p>
            <p className="text-t-18 text-ash mt-6 max-w-prose">
              Mini sessions, portraits, engagements, and full-day weddings. A 30% deposit confirms
              the date; the remainder is due on the day of the shoot.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/services"
                className="text-t-14 text-bone bg-ink px-6 py-3 hover:bg-accent transition-colors"
              >
                See all services
              </Link>
              <Link
                href="/book"
                className="text-t-14 underline underline-offset-4 hover:text-accent transition-colors"
              >
                Available dates
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
