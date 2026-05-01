import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtDateAndTime, fmtFullDate } from '@/lib/dates';
import { formatUsd } from '@/lib/money';
import { BookingControls } from './BookingControls';

export const metadata = { title: 'Booking · Admin' };

export default async function BookingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles:customer_id (id, full_name, email, phone),
      photographers (public_name),
      session_types (name)
    `)
    .eq('id', id)
    .single();
  if (!booking) notFound();

  const { data: emails } = await supabase
    .from('email_log')
    .select('to_email, subject, template, sent_at, error')
    .eq('booking_id', id)
    .order('sent_at', { ascending: false });

  const { data: gallery } = await supabase
    .from('gallery_items')
    .select('id, file_name, kind, size_bytes')
    .eq('booking_id', id)
    .order('order_index');

  return (
    <>
      <Link
        href="/admin/bookings"
        className="text-ash text-t-12 eyebrow-label hover:text-accent"
      >
        ← All bookings
      </Link>

      <header className="mt-10 mb-12 grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-7">
          <p className="text-ash text-t-12 eyebrow-label mb-3">
            {booking.session_types?.name ?? 'Session'}
          </p>
          <h2 className="font-serif text-t-36 leading-tight">
            {booking.profiles?.full_name ?? booking.profiles?.email}
          </h2>
          <p className="text-ash text-t-16 font-light mt-2">
            {fmtDateAndTime(booking.starts_at)}
          </p>
        </div>
        <dl className="col-span-12 md:col-span-5 grid grid-cols-3 gap-4 text-t-14">
          <Field label="Total" value={formatUsd(booking.amount_cents)} />
          <Field label="Deposit" value={formatUsd(booking.deposit_cents)} />
          <Field label="Balance" value={formatUsd(booking.amount_cents - booking.deposit_cents)} />
        </dl>
      </header>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-7 space-y-12">
          <section>
            <p className="text-ash text-t-12 eyebrow-label mb-4">Customer</p>
            <p className="text-t-16">{booking.profiles?.email}</p>
            {booking.profiles?.phone && (
              <p className="text-ash text-t-14 font-light">{booking.profiles.phone}</p>
            )}
            {booking.profiles?.id && (
              <Link
                href={`/admin/customers/${booking.profiles.id}`}
                className="inline-block mt-3 text-t-12 eyebrow-label underline hover:text-accent"
              >
                Customer profile →
              </Link>
            )}
          </section>

          <section>
            <p className="text-ash text-t-12 eyebrow-label mb-4">Photographer</p>
            <p className="text-t-16">{booking.photographers?.public_name ?? 'Unassigned'}</p>
          </section>

          <section>
            <p className="text-ash text-t-12 eyebrow-label mb-4">Gallery</p>
            {gallery && gallery.length > 0 ? (
              <ul className="border-y border-mist divide-y divide-mist text-t-14">
                {gallery.map((g) => (
                  <li key={g.id} className="py-3 flex justify-between">
                    <span>{g.file_name ?? '—'}</span>
                    <span className="text-ash">{g.kind}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ash text-t-14 font-light">No gallery uploaded yet.</p>
            )}
            <Link
              href={`/admin/bookings/${booking.id}/gallery`}
              className="inline-block mt-4 text-t-12 eyebrow-label underline hover:text-accent"
            >
              Manage gallery →
            </Link>
          </section>

          <section>
            <p className="text-ash text-t-12 eyebrow-label mb-4">Email log</p>
            {emails && emails.length > 0 ? (
              <ul className="border-y border-mist divide-y divide-mist text-t-12">
                {emails.map((e, i) => (
                  <li key={i} className="py-3 flex justify-between gap-4">
                    <span>
                      {e.subject}
                      {e.error && <span className="text-red-700 ml-2">· error</span>}
                    </span>
                    <span className="text-ash">{fmtFullDate(e.sent_at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ash text-t-14 font-light">No emails sent.</p>
            )}
          </section>

          {booking.cancelled_at && (
            <section className="border border-red-700/30 p-4">
              <p className="text-ash text-t-12 eyebrow-label mb-2">Cancelled</p>
              <p className="text-t-14">
                {fmtDateAndTime(booking.cancelled_at)} · by {booking.cancelled_by}
              </p>
              {booking.cancellation_reason && (
                <p className="text-t-14 text-ash italic font-light mt-2">
                  {booking.cancellation_reason}
                </p>
              )}
            </section>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
          <BookingControls
            bookingId={booking.id}
            stage={booking.pipeline_stage}
            notes={booking.notes ?? ''}
            depositCents={booking.deposit_cents}
          />
        </aside>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ash text-t-12 eyebrow-label mb-1">{label}</dt>
      <dd className="font-serif text-t-22">{value}</dd>
    </div>
  );
}
