'use client';

import { useMemo, useState } from 'react';
import { formatUsd, computeDeposit } from '@/lib/money';
import { CheckoutButton } from './[slotId]/CheckoutButton';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

type WizardSlot = {
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

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function BookWizard({
  slots,
  signedIn,
  paymentsConfigured,
}: {
  slots: WizardSlot[];
  signedIn: boolean;
  paymentsConfigured: boolean;
}) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const first = slots[0] ? new Date(slots[0].starts_at) : new Date();
    return new Date(first.getFullYear(), first.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const byDay = useMemo(() => {
    const map = new Map<string, WizardSlot[]>();
    for (const slot of slots) {
      const key = new Date(slot.starts_at).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(slot);
    }
    for (const [day, values] of map) {
      map.set(
        day,
        values.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
      );
    }
    return map;
  }, [slots]);

  const calendarDays = useMemo(() => {
    const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const end = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    const leading = start.getDay();
    const cells: Array<{ key: string; date: Date | null }> = [];
    for (let i = 0; i < leading; i += 1) cells.push({ key: `empty-start-${i}`, date: null });
    for (let day = 1; day <= end.getDate(); day += 1) {
      cells.push({
        key: `day-${day}`,
        date: new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day),
      });
    }
    while (cells.length % 7 !== 0) cells.push({ key: `empty-end-${cells.length}`, date: null });
    return cells;
  }, [monthCursor]);

  const daySlots = selectedDay ? byDay.get(selectedDay) ?? [] : [];
  const selectedSlot = daySlots.find((slot) => slot.id === selectedSlotId) ?? null;
  const depositCents = selectedSlot?.session_types
    ? computeDeposit(selectedSlot.price_cents, Number(selectedSlot.session_types.deposit_pct) || 0.3)
    : 0;

  return (
    <div className="space-y-12">
      <section className="border border-mist">
        <div className="px-4 py-3 border-b border-mist">
          <p className="text-ash text-t-12 eyebrow-label">Step 1 · Select a date</p>
          <p className="text-t-14 text-ash mt-2 font-light">
            Choose a highlighted date to continue through the booking wizard.
          </p>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-mist">
          <button
            type="button"
            className="text-t-12 eyebrow-label text-ash hover:text-accent"
            onClick={() =>
              setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))
            }
          >
            ← Prev
          </button>
          <p className="font-serif text-t-22">{monthLabel(monthCursor)}</p>
          <button
            type="button"
            className="text-t-12 eyebrow-label text-ash hover:text-accent"
            onClick={() =>
              setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))
            }
          >
            Next →
          </button>
        </div>
        <div className="grid grid-cols-7 border-b border-mist text-center text-t-12 text-ash">
          {DAY_NAMES.map((name) => (
            <div key={name} className="py-2 border-r border-mist last:border-r-0">
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((cell) => {
            if (!cell.date) return <div key={cell.key} className="h-16 border-r border-b border-mist/60" />;
            const key = toDateInput(cell.date);
            const available = byDay.get(key)?.length ?? 0;
            const selected = selectedDay === key;
            return (
              <button
                key={cell.key}
                type="button"
                disabled={!available}
                onClick={() => {
                  setSelectedDay(key);
                  setSelectedSlotId(null);
                  setConfirmed(false);
                }}
                className={`h-16 border-r border-b border-mist/60 px-2 text-left transition-colors ${
                  selected
                    ? 'bg-ink text-bone'
                    : available
                      ? 'bg-mist/50 hover:bg-mist'
                      : 'text-ash/40 cursor-not-allowed'
                }`}
              >
                <span className="block text-t-14">{cell.date.getDate()}</span>
                {available ? (
                  <span className={`block text-[11px] ${selected ? 'text-bone/80' : 'text-ash'}`}>
                    {available} time{available === 1 ? '' : 's'}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {selectedDay ? (
        <section className="border border-mist">
          <div className="px-4 py-3 border-b border-mist">
            <p className="text-ash text-t-12 eyebrow-label">Step 2 · Choose a time</p>
            <p className="font-serif text-t-22 mt-2">
              {new Date(`${selectedDay}T00:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-t-14 text-ash mt-2">
              {daySlots[0]?.session_types?.name ?? 'Session'} · {daySlots.length} time
              {daySlots.length === 1 ? '' : 's'} available
            </p>
          </div>
          <ul className="divide-y divide-mist">
            {daySlots.map((slot) => {
              const active = selectedSlotId === slot.id;
              return (
                <li key={slot.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSlotId(slot.id);
                      setConfirmed(false);
                    }}
                    className={`w-full grid grid-cols-12 gap-6 py-5 px-4 text-left transition-colors ${
                      active ? 'bg-mist/60' : 'hover:bg-mist/30'
                    }`}
                  >
                    <p className="col-span-6 md:col-span-3 font-serif text-t-22">
                      {new Date(slot.starts_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="col-span-6 md:col-span-3 text-t-14 text-ash font-light">
                      {slot.duration_minutes} minutes
                    </p>
                    <p className="col-span-6 md:col-span-3 text-t-14 text-ash font-light">
                      {slot.location_label ?? 'On-location'}
                    </p>
                    <p className="col-span-6 md:col-span-3 font-serif text-t-22 text-right md:text-left">
                      {formatUsd(slot.price_cents)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {selectedSlot ? (
        <section className="border border-mist">
          <div className="px-4 py-3 border-b border-mist">
            <p className="text-ash text-t-12 eyebrow-label">Step 3 · Review session details</p>
            <p className="font-serif text-t-28 mt-3">{selectedSlot.session_types?.name}</p>
            <p className="text-t-14 text-ash mt-2 font-light">
              {new Date(selectedSlot.starts_at).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              at{' '}
              {new Date(selectedSlot.starts_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="grid grid-cols-12 gap-8 px-4 py-6">
            <div className="col-span-12 md:col-span-8 space-y-4">
              {selectedSlot.session_types?.summary ? (
                <p className="text-t-16 text-ash font-light">{selectedSlot.session_types.summary}</p>
              ) : null}
              {selectedSlot.session_types?.description ? (
                <p className="font-serif text-t-22 leading-relaxed">{selectedSlot.session_types.description}</p>
              ) : null}
              <p className="text-t-14 text-ash">
                Photographer: {selectedSlot.photographers?.public_name ?? 'Either photographer'}
              </p>
            </div>
            <aside className="col-span-12 md:col-span-4 border-t border-mist pt-5 md:border-t-0 md:border-l md:pl-6 md:pt-0">
              <p className="text-t-12 eyebrow-label text-ash">Deposit due now</p>
              <p className="font-serif text-t-36 mt-2">{formatUsd(depositCents)}</p>
              <p className="text-t-14 text-ash font-light mt-2">
                30% deposit confirms your date. Remaining balance is due on session day.
              </p>
              <label className="flex items-start gap-2 mt-5 text-t-14 text-ash">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-ink"
                />
                <span>I reviewed the session details for this date and time.</span>
              </label>
              <div className={`mt-5 ${confirmed ? '' : 'opacity-50 pointer-events-none'}`}>
                <CheckoutButton
                  slotId={selectedSlot.id}
                  signedIn={signedIn}
                  paymentsConfigured={paymentsConfigured}
                />
              </div>
              {!confirmed ? (
                <p className="text-t-12 text-ash mt-3">Confirm details to continue to deposit.</p>
              ) : null}
            </aside>
          </div>
        </section>
      ) : null}
    </div>
  );
}
