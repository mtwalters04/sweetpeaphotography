import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtFullDate, fmtDateAndTime } from '@/lib/dates';
import { formatUsd } from '@/lib/money';
import { WithdrawButton } from './WithdrawButton';

export const metadata: Metadata = { title: 'Request detail' };

export default async function CustomerRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: req } = await supabase
    .from('custom_requests')
    .select(`
      *,
      quote_slot:quote_slot_id (id, starts_at, status)
    `)
    .eq('id', id)
    .single();
  if (!req) notFound();

  return (
    <div className="max-w-prose mx-auto">
      <Link
        href="/account/requests"
        className="text-ash text-t-12 eyebrow-label hover:text-accent"
      >
        ← All requests
      </Link>

      <p className="text-ash text-t-12 eyebrow-label mt-12 mb-3">{req.status}</p>
      <h1 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.015em]">
        {req.preferred_date ? fmtFullDate(req.preferred_date) : 'Custom request'}
      </h1>

      <div className="mt-12 space-y-10">
        <section>
          <p className="text-ash text-t-12 eyebrow-label mb-4">Your message</p>
          <p className="text-t-16 whitespace-pre-wrap font-light leading-relaxed">{req.message}</p>
        </section>

        {req.status === 'quoted' && req.quote_amount_cents && (
          <section className="border border-mist p-6 bg-vellum/40">
            <p className="text-ash text-t-12 eyebrow-label mb-2">Your quote</p>
            <p className="font-serif text-t-48 leading-none">
              {formatUsd(req.quote_amount_cents)}
            </p>
            {req.quote_slot && (
              <p className="text-ash text-t-14 font-light italic mt-3">
                For {fmtDateAndTime(req.quote_slot.starts_at)}
              </p>
            )}
            {req.quote_message && (
              <p className="text-t-14 mt-4 whitespace-pre-wrap font-light leading-relaxed">
                {req.quote_message}
              </p>
            )}
            {req.quote_slot?.status === 'open' && (
              <Link
                href={`/book/${req.quote_slot.id}`}
                className="inline-block mt-6 text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent"
              >
                Accept and pay deposit →
              </Link>
            )}
          </section>
        )}

        {req.status === 'declined' && req.declined_reason && (
          <section className="border border-mist p-6">
            <p className="text-ash text-t-12 eyebrow-label mb-2">Note from the studio</p>
            <p className="text-t-14 whitespace-pre-wrap font-light leading-relaxed">
              {req.declined_reason}
            </p>
          </section>
        )}

        {req.status === 'converted' && (
          <section>
            <p className="font-serif text-t-22">Booked.</p>
            <Link
              href="/account/bookings"
              className="inline-block mt-3 text-t-12 eyebrow-label underline hover:text-accent"
            >
              See bookings →
            </Link>
          </section>
        )}

        {(req.status === 'pending' || req.status === 'quoted') && (
          <section className="pt-6">
            <WithdrawButton requestId={req.id} />
          </section>
        )}
      </div>
    </div>
  );
}
