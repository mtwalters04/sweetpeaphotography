import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatUsd } from '@/lib/money';
import { ensureSessionTypesSeeded } from '@/lib/session-types';
import { DayAvailabilityForm } from './DayAvailabilityForm';
import { createDaySlots } from './actions';

export const metadata = { title: 'Slots · Admin' };

export default async function SlotsIndex() {
  const supabase = await createClient();
  await ensureSessionTypesSeeded(supabase);
  const [{ data: slots }, { data: services }] = await Promise.all([
    supabase
      .from('available_slots')
      .select(`
        id,
        starts_at,
        duration_minutes,
        price_cents,
        status,
        location_label,
        private_for_user,
        session_types (name, slug),
        photographers (public_name)
      `)
      .order('starts_at', { ascending: true }),
    supabase
      .from('session_types')
      .select('id, name, duration_minutes, active')
      .order('order_index'),
  ]);

  const grouped = new Map<
    string,
    {
      dayLabel: string;
      sessionName: string;
      slots: NonNullable<typeof slots>;
    }
  >();

  for (const slot of slots ?? []) {
    const startsAt = new Date(slot.starts_at);
    const dayKey = startsAt.toISOString().slice(0, 10);
    if (!grouped.has(dayKey)) {
      grouped.set(dayKey, {
        dayLabel: startsAt.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        sessionName: slot.session_types?.name ?? '—',
        slots: [],
      });
    }
    grouped.get(dayKey)!.slots.push(slot);
  }

  const dayMap = new Map<
    string,
    { date: string; sessionName: string; activeCount: number; cancelledCount: number }
  >();
  for (const slot of slots ?? []) {
    const day = new Date(slot.starts_at).toISOString().slice(0, 10);
    if (!dayMap.has(day)) {
      dayMap.set(day, {
        date: day,
        sessionName: slot.session_types?.name ?? 'Existing session',
        activeCount: 0,
        cancelledCount: 0,
      });
    }
    if (slot.status === 'cancelled') {
      dayMap.get(day)!.cancelledCount += 1;
    } else {
      dayMap.get(day)!.activeCount += 1;
    }
  }

  const dayGroups = Array.from(grouped.values());

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-2">Calendar</p>
          <h2 className="font-serif text-t-28">Calendar slots</h2>
          <p className="text-t-14 text-ash mt-2 font-light">
            Choose a date, set one session type for that day, and build time blocks.
          </p>
        </div>
      </div>

      <section className="mb-14 border-y border-mist py-10">
        <DayAvailabilityForm
          action={createDaySlots}
          serviceOptions={(services ?? []).map((s) => ({
            value: s.id,
            label: s.active ? s.name : `${s.name} (inactive)`,
            durationMinutes: s.duration_minutes,
          }))}
          existingDays={Array.from(dayMap.values())}
        />
      </section>

      <div className="flex items-center justify-between mb-6">
        <p className="text-ash text-t-12 eyebrow-label">Published availability</p>
        {(!services || services.length === 0) && (
          <Link
            href="/admin/services/new"
            className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent"
          >
            Create a session type first →
          </Link>
        )}
      </div>

      {dayGroups.length > 0 ? (
        <div className="space-y-10">
          {dayGroups.map((group) => (
            <section key={group.dayLabel} className="border-y border-mist">
              <header className="px-4 py-4 border-b border-mist bg-bone/60">
                <p className="text-t-12 eyebrow-label text-ash">Date</p>
                <p className="font-serif text-t-22 mt-1">{group.dayLabel}</p>
                <p className="text-t-14 text-ash mt-2">
                  Session type: <span className="text-ink">{group.sessionName}</span>
                </p>
              </header>
              <ul className="divide-y divide-mist">
                {group.slots.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/admin/slots/${s.id}/edit`}
                      className="grid grid-cols-12 gap-6 py-5 px-4 items-baseline hover:text-accent transition-colors"
                    >
                      <p className="col-span-12 md:col-span-3 font-serif text-t-22">
                        {new Date(s.starts_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="col-span-6 md:col-span-3 text-ash text-t-14 font-light">
                        {s.photographers?.public_name ?? 'Either photographer'}
                      </p>
                      <p className="col-span-6 md:col-span-2 font-serif text-t-18">
                        {formatUsd(s.price_cents)}
                      </p>
                      <p className="col-span-6 md:col-span-2 text-t-12 text-ash">
                        {s.location_label ?? 'On-location'}
                      </p>
                      <p className="col-span-6 md:col-span-2 text-t-12 eyebrow-label text-ash">
                        {s.private_for_user ? `${s.status} · private` : s.status}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="border-y border-mist py-16 text-center">
          <p className="text-t-22 text-ash">No available dates published.</p>
          <Link
            href="/admin/slots"
            className="inline-block mt-6 text-t-14 underline hover:text-accent"
          >
            Publish day availability →
          </Link>
        </div>
      )}
    </>
  );
}
