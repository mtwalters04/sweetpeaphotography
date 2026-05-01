import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { fmtDateAndTime } from '@/lib/dates';
import { formatUsd, computeDeposit } from '@/lib/money';
import { env } from '@/lib/env';
import { SectionEyebrow } from '@/components/section-eyebrow';
import { CheckoutButton } from './CheckoutButton';

export const metadata: Metadata = {
  title: 'Book this date',
  description: 'Confirm a session date with Sweet Pea Photography.',
};

export default async function BookSlotPage({
  params,
}: {
  params: Promise<{ slotId: string }>;
}) {
  const { slotId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use admin client so we can read private slots if the viewer happens to be the owner;
  // verify ownership in code rather than relying on RLS for the read.
  const admin = createAdminClient();
  const { data: slot } = await admin
    .from('available_slots')
    .select(`
      id, starts_at, duration_minutes, price_cents, location_label, status,
      private_for_user,
      session_types (id, name, eyebrow, summary, description, deposit_pct),
      photographers (public_name, public_bio)
    `)
    .eq('id', slotId)
    .single();
  if (!slot || !slot.session_types) notFound();

  // Block strangers from a private slot.
  if (slot.private_for_user && slot.private_for_user !== user?.id) notFound();

  const depositCents = computeDeposit(slot.price_cents, Number(slot.session_types.deposit_pct));
  const isOpen = slot.status === 'open';

  return (
    <>
      <header className="pt-[clamp(160px,22vw,288px)] pb-[clamp(56px,8vw,112px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8">
            <Link
              href="/book"
              className="text-ash text-t-12 eyebrow-label hover:text-accent transition-colors"
            >
              ← All available dates
            </Link>
            <p className="text-ash text-t-12 eyebrow-label mt-12 mb-4">
              {slot.session_types.eyebrow ?? slot.session_types.name}
            </p>
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1] tracking-[-0.02em]">
              {slot.session_types.name}
            </h1>
            <p className="font-serif text-t-22 italic font-light text-ash mt-6">
              {fmtDateAndTime(slot.starts_at)}
            </p>
            {slot.session_types.summary && (
              <p className="text-t-22 text-ash mt-10 max-w-prose font-light leading-relaxed">
                {slot.session_types.summary}
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="pb-[clamp(96px,12vw,192px)]">
        <div className="max-w-content mx-auto px-6 grid grid-cols-12 gap-12">
          <div className="col-span-12 md:col-span-7 space-y-10">
            {slot.session_types.description && (
              <div>
                <p className="text-ash text-t-12 eyebrow-label mb-4">The session</p>
                <p className="font-serif text-[clamp(1.3rem,2.4vw,1.75rem)] leading-[1.4] max-w-prose">
                  {slot.session_types.description}
                </p>
              </div>
            )}
            {slot.photographers && (
              <div>
                <p className="text-ash text-t-12 eyebrow-label mb-4">Photographer</p>
                <p className="font-serif text-t-28">{slot.photographers.public_name}</p>
                {slot.photographers.public_bio && (
                  <p className="text-ash text-t-14 mt-2 font-light max-w-prose">
                    {slot.photographers.public_bio}
                  </p>
                )}
              </div>
            )}
          </div>

          <aside className="col-span-12 md:col-span-4 md:col-start-9 border-t border-mist pt-10 md:border-t-0 md:border-l md:pl-10 md:pt-0">
            <p className="text-ash text-t-12 eyebrow-label">Total session</p>
            <p className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-none mt-3 tracking-[-0.02em]">
              {formatUsd(slot.price_cents)}
            </p>
            <p className="text-ash text-t-14 mt-3 font-light italic">
              {slot.duration_minutes} minutes
            </p>

            <div className="mt-10 border-t border-mist pt-6">
              <p className="text-ash text-t-12 eyebrow-label">Deposit due today</p>
              <p className="font-serif text-t-36 mt-2">{formatUsd(depositCents)}</p>
              <p className="text-ash text-t-14 font-light italic mt-2">
                Balance of {formatUsd(slot.price_cents - depositCents)} due on the day.
              </p>
            </div>

            <div className="mt-10">
              {isOpen ? (
                <CheckoutButton
                  slotId={slot.id}
                  signedIn={!!user}
                  paymentsConfigured={env.hasStripe()}
                />
              ) : (
                <p className="text-t-14 text-ash italic font-light">
                  This date is no longer open.{' '}
                  <Link href="/book" className="underline hover:text-accent not-italic">
                    See other dates
                  </Link>
                  .
                </p>
              )}
            </div>

            <p className="text-ash text-t-12 mt-10 font-light italic leading-relaxed">
              No cash refunds. Cancellations made 48+ hours out become studio credit on your
              account.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
