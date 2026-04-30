import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { placeholderSrc } from '@/lib/placeholder';

export const metadata: Metadata = {
  title: 'About',
  description: 'Two photographers, one studio, one local market.',
};

// TODO: replace with real photographer bios + photos.
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
      <header className="pt-[clamp(128px,18vw,224px)] pb-[clamp(64px,8vw,128px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-7">
            <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-6">The studio</p>
            <h1 className="font-serif text-t-48 md:text-t-64 leading-[1.05]">
              Two photographers. One studio. The same patient eye.
            </h1>
          </div>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-7 md:col-start-3">
            <p className="text-t-22 leading-[1.5] max-w-prose">
              We started Sweet Pea because we wanted a quieter way to do this work — fewer
              clients, longer relationships, photographs that survive a move and a renovation and
              the back of a drawer.
            </p>
            <p className="text-t-18 text-ash leading-[1.6] max-w-prose mt-8">
              Most of our weeks are weddings, portraits, and families we have known for years. We
              shoot in a single local market, travel by request, and book a small number of days
              each month so the editing never gets ahead of the living.
            </p>
            <p className="text-t-18 text-ash leading-[1.6] max-w-prose mt-6">
              You will usually have both of us on a wedding day. For a portrait it is one of us
              and a wide window.
            </p>
          </div>
        </div>
      </section>

      {/* Photographers */}
      <section className="pb-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
          {PHOTOGRAPHERS.map((p) => (
            <article key={p.seed} className="flex flex-col">
              <div className="relative aspect-[4/5] bg-mist overflow-hidden">
                <Image
                  src={placeholderSrc(p.seed, 1000, 1250)}
                  alt={`Portrait of ${p.name}`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-8">
                <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-2">{p.role}</p>
                <h2 className="font-serif text-t-36">{p.name}</h2>
                <p className="text-ash text-t-16 mt-4 max-w-prose">{p.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 text-center">
          <p className="font-serif text-t-36 max-w-prose mx-auto leading-tight">
            We would love to hear about your day.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/contact"
              className="text-t-14 text-bone bg-ink px-6 py-3 hover:bg-accent transition-colors"
            >
              Get in touch
            </Link>
            <Link
              href="/services"
              className="text-t-14 underline underline-offset-4 hover:text-accent transition-colors"
            >
              See services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
