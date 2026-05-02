import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { placeholderSrc } from '@/lib/placeholder';
import { CtaLink } from '@/components/cta-link';
import { SectionEyebrow } from '@/components/section-eyebrow';

export const metadata: Metadata = {
  title: 'About',
  description: 'Two photographers, one studio, one local market.',
};

const PHOTOGRAPHERS = [
  {
    seed: 'photographer-a',
    name: 'Photographer A',
    role: 'Lead photographer',
    bio: 'Trained in painting before turning to photography. Works in soft natural light, never with flash, and is most at home with one person and a wide lens.',
  },
  {
    seed: 'photographer-b',
    name: 'Photographer B',
    role: 'Second shooter, owner',
    bio: 'Quiet on a wedding day, useful in a kitchen, indispensable when there are children. Handles the studio side and most of the editing.',
  },
] as const;

export default function About() {
  return (
    <>
      <section className="pt-[clamp(112px,12vw,156px)] pb-[clamp(96px,14vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8 md:col-start-3">
            <p className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.35] max-w-prose">
              We started Sweet Pea because we wanted a{' '}
              <span className="italic font-light">quieter way</span> to do this work — fewer
              clients, longer relationships, photographs that survive a move and a renovation and
              the back of a drawer.
            </p>
            <div className="space-y-6 mt-12 text-t-18 text-ash font-light leading-relaxed max-w-prose">
              <p>
                Most of our weeks are weddings, portraits, and families we have known for years. We
                shoot in a single local market, travel by request, and book a small number of days
                each month so the editing never gets ahead of the living.
              </p>
              <p>
                You will usually have both of us on a wedding day. For a portrait it is one of us
                and a wide window.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-[clamp(96px,14vw,192px)] border-t border-mist pt-[clamp(72px,10vw,144px)]">
        <div className="max-w-content mx-auto px-6 mb-14">
          <SectionEyebrow number="01" label="Behind the camera" />
        </div>
        <div className="max-w-content mx-auto px-6 space-y-20 md:space-y-24">
          {PHOTOGRAPHERS.map((p, i) => (
            <article key={p.seed} className="grid grid-cols-12 gap-8 md:gap-12 items-center">
              <div
                className={`col-span-12 md:col-span-5 ${
                  i % 2 === 0 ? 'md:col-start-1' : 'md:col-start-8'
                }`}
              >
                <div className="relative aspect-[4/5] bg-mist overflow-hidden">
                  <Image
                    src={placeholderSrc(p.seed, 1200, 1500)}
                    alt={`Portrait of ${p.name}`}
                    fill
                    sizes="(min-width: 768px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div
                className={`col-span-12 md:col-span-5 ${
                  i % 2 === 0 ? 'md:col-start-7' : 'md:col-start-1 md:row-start-1'
                }`}
              >
                <p className="text-ash text-t-12 uppercase tracking-[0.22em] mb-3">{p.role}</p>
                <h2 className="font-serif text-[clamp(2rem,3.5vw,2.75rem)] leading-tight tracking-[-0.01em]">
                  {p.name}
                </h2>
                <p className="text-ash text-t-16 mt-5 max-w-prose font-light leading-relaxed">
                  {p.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-[clamp(120px,18vw,224px)] border-t border-mist">
        <div className="max-w-content mx-auto px-6 text-center">
          <p className="text-ash text-t-12 uppercase tracking-[0.28em] mb-10">Begin</p>
          <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.02em] max-w-3xl mx-auto">
            We would love to hear
            <br />
            <span className="italic font-light">about your day.</span>
          </h2>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 text-t-14 uppercase tracking-[0.18em] text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-500"
            >
              <span>Get in touch</span>
              <span aria-hidden>→</span>
            </Link>
            <CtaLink href="/services" variant="secondary">
              See services
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  );
}
