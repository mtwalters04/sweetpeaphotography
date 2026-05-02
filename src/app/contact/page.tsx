import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { STUDIO } from '@/lib/content/studio';
import { env } from '@/lib/env';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Send us your question and contact details. We respond within two business days.',
};

export default async function Contact() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name, phone, email').eq('id', user.id).single()
    : { data: null };

  return (
    <>
      <section className="pt-[clamp(112px,12vw,156px)] pb-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-12">
          <div className="col-span-12 md:col-span-7">
            <ContactForm
              signedIn={!!user}
              uploadsEnabled={env.hasR2()}
              initialContact={{
                fullName: profile?.full_name ?? '',
                email: profile?.email ?? user?.email ?? '',
                phone: profile?.phone ?? '',
              }}
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
