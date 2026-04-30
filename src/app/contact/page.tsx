import type { Metadata } from 'next';
import Link from 'next/link';
import { SERVICES } from '@/lib/content/services';
import { STUDIO } from '@/lib/content/studio';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Request a custom date or session. We respond within two business days.',
};

// NOTE: form is a stub for Phase 1. Phase 4 wires the request to Supabase + Resend.
export default function Contact() {
  return (
    <>
      <header className="pt-[clamp(128px,18vw,224px)] pb-[clamp(48px,6vw,96px)]">
        <div className="max-w-content mx-auto px-6">
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-6">Contact</p>
          <h1 className="font-serif text-t-48 md:text-t-64 max-w-3xl leading-[1.05]">
            Tell us about the day.
          </h1>
          <p className="text-t-18 text-ash mt-8 max-w-prose">
            For custom dates, off-list session types, or just to say hello. We respond within two
            business days. If you would rather see what is already on the calendar,{' '}
            <Link href="/book" className="underline underline-offset-4 hover:text-accent">
              available dates live here
            </Link>
            .
          </p>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-12">
          <form
            className="col-span-12 md:col-span-7 space-y-8"
            // Stubbed — wired in Phase 4.
            action="#"
            method="post"
          >
            <Field label="Your name" name="name" type="text" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone (optional)" name="phone" type="tel" />
            <Field label="Preferred date" name="date" type="date" />

            <div>
              <label
                htmlFor="service"
                className="block text-ash text-t-12 uppercase tracking-[0.2em] mb-3"
              >
                Type of session
              </label>
              <select
                id="service"
                name="service"
                className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-16 outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Select…
                </option>
                {SERVICES.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
                <option value="other">Something else</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-ash text-t-12 uppercase tracking-[0.2em] mb-3"
              >
                What would you like us to know?
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-16 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled
              className="text-t-14 text-bone bg-ink px-6 py-3 opacity-60 cursor-not-allowed"
              title="Form submission lands in Phase 4."
            >
              Send request
            </button>
            <p className="text-t-12 text-ash">
              Form submission is being wired up. In the meantime, email us directly at{' '}
              <a
                href={`mailto:${STUDIO.email}`}
                className="underline underline-offset-4 hover:text-accent"
              >
                {STUDIO.email}
              </a>
              .
            </p>
          </form>

          <aside className="col-span-12 md:col-span-4 md:col-start-9 border-t border-mist pt-8 md:border-t-0 md:border-l md:pl-10 md:pt-0">
            <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-4">Studio</p>
            <p className="text-t-16">
              <a
                href={`mailto:${STUDIO.email}`}
                className="underline underline-offset-4 hover:text-accent"
              >
                {STUDIO.email}
              </a>
            </p>
            <p className="text-t-16 text-ash mt-2">{STUDIO.phone}</p>
            <p className="text-t-16 text-ash mt-2">
              {STUDIO.address.locality}, {STUDIO.address.region}
            </p>

            <p className="text-ash text-t-12 uppercase tracking-[0.2em] mt-10 mb-4">Hours</p>
            <p className="text-t-14 text-ash">
              By appointment. Mondays and Tuesdays reserved for editing.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 uppercase tracking-[0.2em] mb-3">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-16 outline-none"
      />
    </div>
  );
}
