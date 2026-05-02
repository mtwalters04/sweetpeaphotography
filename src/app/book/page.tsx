import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { releaseExpiredHolds } from '@/lib/bookings';
import { CtaLink } from '@/components/cta-link';
import { env } from '@/lib/env';
import { BookWizard } from './BookWizard';

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
  session_types: {
    name: string;
    eyebrow: string | null;
    summary: string | null;
    description: string | null;
    deposit_pct: number;
  } | null;
  photographers: { public_name: string } | null;
};

export default async function BookPage() {
  // Lazy cleanup: Hobby plan can't run sub-daily crons, so we release stale
  // holds (15-min expiry) on the read path.
  await releaseExpiredHolds().catch(() => undefined);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: slots } = await supabase
    .from('available_slots')
    .select(`
      id, starts_at, duration_minutes, price_cents, location_label,
      session_types (name, eyebrow, summary, description, deposit_pct),
      photographers (public_name)
    `)
    .eq('status', 'open')
    .is('private_for_user', null)
    .gte('starts_at', now())
    .order('starts_at', { ascending: true })
    .returns<SlotRow[]>();

  let balanceCents = 0;
  if (user) {
    const { data: bal } = await supabase
      .from('credit_balances')
      .select('balance_cents')
      .eq('customer_id', user.id)
      .maybeSingle();
    balanceCents = bal?.balance_cents ?? 0;
  }

  return (
    <>
      <section className="pt-[clamp(112px,12vw,156px)] pb-[clamp(96px,12vw,192px)]">
        {(slots?.length ?? 0) === 0 ? (
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
          <div className="max-w-content mx-auto px-6">
            <BookWizard
              slots={(slots ?? []) as SlotRow[]}
              signedIn={!!user}
              stripeConfigured={env.hasStripe()}
              balanceCents={balanceCents}
            />
          </div>
        )}
      </section>
    </>
  );
}
