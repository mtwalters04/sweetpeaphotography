import type { Metadata } from 'next';
import Link from 'next/link';
import { SERVICES } from '@/lib/content/services';
import { STUDIO } from '@/lib/content/studio';
import { SectionEyebrow } from '@/components/section-eyebrow';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Request a custom date or session. We respond within two business days.',
};

export default function Contact() {
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
          <form
            className="col-span-12 md:col-span-7 space-y-10"
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
                className="block text-ash text-t-12 uppercase tracking-[0.22em] mb-4"
              >
                Type of session
              </label>
              <select
                id="service"
                name="service"
                className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-4 text-t-16 outline-none font-light"
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
                className="block text-ash text-t-12 uppercase tracking-[0.22em] mb-4"
              >
                What would you like us to know?
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-4 text-t-16 outline-none resize-none font-light"
              />
            </div>

            <button
              type="submit"
              disabled
              className="text-t-12 uppercase tracking-[0.2em] text-ink border-b border-ink pb-1 opacity-50 cursor-not-allowed"
              title="Form submission lands soon."
            >
              Send request →
            </button>
            <p className="text-t-12 text-ash font-light italic">
              Form submission is being wired up. In the meantime, write to us at{' '}
              <a
                href={`mailto:${STUDIO.email}`}
                className="underline underline-offset-4 hover:text-accent not-italic"
              >
                {STUDIO.email}
              </a>
              .
            </p>
          </form>

          <aside className="col-span-12 md:col-span-4 md:col-start-9 border-t border-mist pt-10 md:border-t-0 md:border-l md:pl-10 md:pt-0">
            <p className="text-ash text-t-12 uppercase tracking-[0.22em] mb-5">Studio</p>
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

            <p className="text-ash text-t-12 uppercase tracking-[0.22em] mt-12 mb-5">Hours</p>
            <p className="text-t-14 text-ash font-light italic">
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
      <label htmlFor={name} className="block text-ash text-t-12 uppercase tracking-[0.22em] mb-4">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-4 text-t-16 outline-none font-light"
      />
    </div>
  );
}
