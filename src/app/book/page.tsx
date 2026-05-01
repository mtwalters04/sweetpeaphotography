import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtDateAndTime, fmtFullDate } from '@/lib/dates';
import { formatUsd } from '@/lib/money';
import { SectionEyebrow } from '@/components/section-eyebrow';
import { CtaLink } from '@/components/cta-link';

export const metadata: Metadata = {
  title: 'Book a session',
  description: 'Available dates from Sweet Pea Photography.',
};

export const revalidate = 60;

const now = () => new Date().toISOString();

type SlotRow = {
  id: string;
  starts_at: string;
  duration_minutes: number;
  price_cents: number;
  location_label: string | null;
  session_types: { name: string; eyebrow: string | null } | null;
  photographers: { public_name: string } | null;
};

export default async function BookPage() {
  const supabase = await createClient();
  const { data: slots } = await supabase
    .from('available_slots')
    .select(`
      id, starts_at, duration_minutes, price_cents, location_label,
      session_types (name, eyebrow),
      photographers (public_name)
    `)
    .eq('status', 'open')
    .is('private_for_user', null)
    .gte('starts_at', now())
    .order('starts_at', { ascending: true })
    .returns<SlotRow[]>();

  // Group by month for editorial calendar feel.
  const byMonth = new Map<string, SlotRow[]>();
  for (const s of slots ?? []) {
    const d = new Date(s.starts_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(s);
  }

  return (
    <>
      <header className="pt-[clamp(160px,22vw,288px)] pb-[clamp(72px,10vw,144px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-7">
            <SectionEyebrow number="—" label="The calendar" />
            <h1 className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.02em] mt-10">
              Available
              <br />
              <span className="italic font-light">dates.</span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="text-ash text-t-16 font-light leading-relaxed max-w-prose">
              Pick a date that works. A 30% deposit confirms the booking. Don't see a date that fits?{' '}
              <Link href="/contact" className="underline underline-offset-4 hover:text-accent">
                Request a custom one
              </Link>
              .
            </p>
          </div>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        {byMonth.size === 0 ? (
          <div className="max-w-content mx-auto px-6 border-y border-mist py-24 text-center">
            <p className="font-serif text-t-28 leading-tight">No open dates right now.</p>
            <p className="text-ash text-t-14 mt-4 max-w-prose mx-auto font-light">
              We open the calendar in batches. Send a request and we will be in touch when a date
              opens — or quote you a custom one.
            </p>
            <div className="mt-10">
              <CtaLink href="/contact">Request a custom date</CtaLink>
            </div>
          </div>
        ) : (
          <div className="max-w-content mx-auto px-6 space-y-20">
            {Array.from(byMonth.entries()).map(([key, monthSlots]) => {
              const [yearStr, monthStr] = key.split('-');
              const monthLabel = new Date(Number(yearStr), Number(monthStr)).toLocaleDateString(
                'en-US',
                { month: 'long', year: 'numeric' },
              );
              return (
                <div key={key}>
                  <h2 className="font-serif text-t-36 leading-tight tracking-[-0.01em] mb-8">
                    {monthLabel}
                  </h2>
                  <ul className="border-y border-mist divide-y divide-mist">
                    {monthSlots.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/book/${s.id}`}
                          className="grid grid-cols-12 gap-6 py-6 items-baseline group hover:text-accent transition-colors duration-300"
                        >
                          <p className="col-span-12 md:col-span-3 font-serif text-t-22">
                            {fmtFullDate(s.starts_at)}
                          </p>
                          <p className="col-span-6 md:col-span-2 text-ash text-t-14 font-light">
                            {new Date(s.starts_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="col-span-6 md:col-span-3 text-t-16">
                            {s.session_types?.name}
                          </p>
                          <p className="col-span-6 md:col-span-2 text-ash text-t-14 font-light">
                            {s.location_label ?? 'On-location'}
                          </p>
                          <p className="col-span-6 md:col-span-2 text-right md:text-left font-serif text-t-22">
                            {formatUsd(s.price_cents)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
