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
    bio: 'Painting before cameras. Soft natural light, no flash — one subject, one wide lens, all patience.',
  },
  {
    seed: 'photographer-b',
    name: 'Photographer B',
    role: 'Second shooter · owner',
    bio: 'Barely there on wedding days, essential with kids and logistics. Runs the desk and most of the edit.',
  },
] as const;

export default function About() {
  return (
    <>
      <section className="pt-[clamp(112px,12vw,156px)] pb-[clamp(96px,14vw,192px)] border-b border-mist">
        <div className="max-w-content mx-auto px-6">
          <SectionEyebrow number="01" label="The studio" />
          <h1 className="font-serif text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.015em] mt-8 max-w-xl text-wrap-balance">
            Two photographers, <span className="italic font-light">one local market.</span>
          </h1>
          <p className="text-t-16 text-ash mt-8 max-w-prose font-light leading-relaxed text-wrap-pretty md:max-w-xl">
            Weddings, portraits, and families we have known for years. We shoot here first, travel
            by request, and keep the calendar spare so editing never overtakes life. Weddings:
            usually both of us. Portraits: one of us and a wide window.
          </p>
        </div>

        <div className="max-w-content mx-auto px-6 mt-16 md:mt-20 space-y-16 md:space-y-20">
          {PHOTOGRAPHERS.map((p, i) => (
            <article
              key={p.seed}
              className="grid grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-start"
            >
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
                className={`col-span-12 md:col-span-6 ${
                  i % 2 === 0 ? 'md:col-start-7' : 'md:col-start-1 md:row-start-1'
                } flex flex-col justify-center md:min-h-[min(100%,420px)]`}
              >
                <p className="text-ash text-t-12 eyebrow-label mb-3">{p.role}</p>
                <h2 className="font-serif text-[clamp(1.85rem,3vw,2.5rem)] leading-tight tracking-[-0.01em]">
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
          <p className="text-ash text-t-12 eyebrow-label mb-10">Begin</p>
          <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.02em] max-w-3xl mx-auto text-wrap-balance">
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
