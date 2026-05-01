import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { STUDIO } from '@/lib/content/studio';
import { SectionEyebrow } from '@/components/section-eyebrow';
import { env } from '@/lib/env';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Request a custom date or session. We respond within two business days.',
};

export default async function Contact() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pull live services from DB; fall back to nothing (form still works).
  const { data: services } = await supabase
    .from('session_types')
    .select('slug, name')
    .eq('active', true)
    .order('order_index');

  return (
    <>
      <header className="pt-[clamp(160px,22vw,288px)] pb-[clamp(56px,8vw,112px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9">
            <SectionEyebrow number="—" label="Contact" />
            <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.02em] mt-10">
              Tell us about
              <br />
              <span className="italic font-light">the day.</span>
            </h1>
            <p className="text-t-22 text-ash mt-10 max-w-prose font-light leading-relaxed">
              For custom dates, off-list session types, or just to say hello. We respond within two
              business days. If you would rather see what is already on the calendar,{' '}
              <Link href="/book" className="underline underline-offset-4 hover:text-accent">
                available dates live here
              </Link>
              .
            </p>
          </div>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-12">
          <div className="col-span-12 md:col-span-7">
            <ContactForm
              signedIn={!!user}
              uploadsEnabled={env.hasR2()}
              services={(services ?? []).map((s) => ({ value: s.slug, label: s.name }))}
            />
          </div>

          <aside className="col-span-12 md:col-span-4 md:col-start-9 border-t border-mist pt-10 md:border-t-0 md:border-l md:pl-10 md:pt-0">
            <p className="text-ash text-t-12 eyebrow-label mb-5">Studio</p>
            <p className="text-t-16">
              <a
                href={`mailto:${STUDIO.email}`}
                className="underline underline-offset-4 hover:text-accent"
              >
                {STUDIO.email}
              </a>
            </p>
            <p className="text-t-16 text-ash mt-2 font-light">{STUDIO.phone}</p>
            <p className="text-t-16 text-ash mt-2 font-light">
              {STUDIO.address.locality}, {STUDIO.address.region}
            </p>

            <p className="text-ash text-t-12 eyebrow-label mt-12 mb-5">Hours</p>
            <p className="text-t-14 text-ash font-light italic">
              By appointment. Mondays and Tuesdays reserved for editing.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
