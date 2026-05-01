import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtFullDate, fmtDateAndTime } from '@/lib/dates';
import { formatUsd } from '@/lib/money';
import { RequestActions } from './RequestActions';

export const metadata = { title: 'Request · Admin' };

export default async function RequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: req }, { data: services }, { data: photographers }] = await Promise.all([
    supabase
      .from('custom_requests')
      .select(`
        *,
        profiles!customer_id (id, full_name, email, phone),
        quote_slot:quote_slot_id (starts_at, status)
      `)
      .eq('id', id)
      .single(),
    supabase
      .from('session_types')
      .select('id, name')
      .eq('active', true)
      .order('order_index'),
    supabase
      .from('photographers')
      .select('id, public_name')
      .eq('active', true)
      .order('order_index'),
  ]);
  if (!req) notFound();

  const { data: notes } = await supabase
    .from('request_messages')
    .select('id, body, created_at, internal, profiles!author_id(full_name, email)')
    .eq('request_id', id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Link href="/admin/requests" className="text-ash text-t-12 eyebrow-label hover:text-accent">
        ← All requests
      </Link>

      <header className="mt-10 mb-12">
        <p className="text-ash text-t-12 eyebrow-label mb-3">{req.status}</p>
        <h2 className="font-serif text-t-36 leading-tight">
          {req.profiles?.full_name ?? req.profiles?.email}
        </h2>
        <p className="text-ash text-t-14 font-light mt-2">
          {req.profiles?.email}
          {req.profiles?.phone && ` · ${req.profiles.phone}`}
        </p>
      </header>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-7 space-y-10">
          <Block label="Message">
            <p className="text-t-16 whitespace-pre-wrap font-light leading-relaxed">{req.message}</p>
          </Block>

          <Block label="Preferred details">
            <dl className="grid grid-cols-2 gap-4 text-t-14">
              <Field label="Date" value={req.preferred_date ? fmtFullDate(req.preferred_date) : '—'} />
              <Field label="Time" value={req.preferred_time ?? '—'} />
              <Field label="Service" value={req.preferred_session_type_slug ?? '—'} />
              <Field label="Photographer" value={req.photographer_pref} />
              <Field label="Location" value={req.location_hint ?? '—'} />
            </dl>
          </Block>

          {req.reference_image_keys.length > 0 && (
            <Block label="Reference images">
              <ul className="text-t-12 text-ash font-light space-y-1">
                {req.reference_image_keys.map((k) => (
                  <li key={k}>· {k}</li>
                ))}
              </ul>
            </Block>
          )}

          {req.quote_amount_cents && (
            <Block label="Current quote">
              <p className="font-serif text-t-36">{formatUsd(req.quote_amount_cents)}</p>
              {req.quote_message && (
                <p className="text-ash text-t-14 mt-2 font-light italic whitespace-pre-wrap">
                  {req.quote_message}
                </p>
              )}
              {req.quote_slot && (
                <p className="text-ash text-t-12 mt-3 eyebrow-label">
                  Slot {fmtDateAndTime(req.quote_slot.starts_at)} · {req.quote_slot.status}
                </p>
              )}
            </Block>
          )}

          {notes && notes.length > 0 && (
            <Block label="Notes">
              <ul className="space-y-3 text-t-14">
                {notes.map((n) => (
                  <li key={n.id} className="border-b border-mist pb-3">
                    <p className="font-light whitespace-pre-wrap">{n.body}</p>
                    <p className="text-t-12 text-ash mt-1 eyebrow-label">
                      {n.profiles?.full_name ?? n.profiles?.email ?? '—'} ·{' '}
                      {fmtDateAndTime(n.created_at)}
                      {n.internal && ' · internal'}
                    </p>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
          <RequestActions
            requestId={req.id}
            status={req.status}
            services={(services ?? []).map((s) => ({ value: s.id, label: s.name }))}
            photographers={(photographers ?? []).map((p) => ({
              value: p.id,
              label: p.public_name,
            }))}
          />
        </aside>
      </div>
    </>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-ash text-t-12 eyebrow-label mb-4">{label}</p>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ash text-t-12 eyebrow-label mb-1">{label}</dt>
      <dd className="text-t-14 font-light">{value}</dd>
    </div>
  );
}
