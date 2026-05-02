'use client';

import { useActionState, useMemo, useState } from 'react';
import { FormError, FormSaved } from '../_components/AdminForm';
import { type State } from './actions';

const initial: State = { error: null, saved: false };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function timeToMinutes(value: string): number {
  const [h = 0, m = 0] = value.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function DayAvailabilityForm({
  action,
  serviceOptions,
  existingDays,
}: {
  action: (prev: State, fd: FormData) => Promise<State>;
  serviceOptions: readonly { value: string; label: string; durationMinutes: number }[];
  existingDays: readonly {
    date: string;
    sessionName: string;
    activeCount: number;
    cancelledCount: number;
  }[];
}) {
  const hasServices = serviceOptions.length > 0;
  const [state, formAction, pending] = useActionState(action, initial);
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState('');
  const [sessionTypeId, setSessionTypeId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [priceDollars, setPriceDollars] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [blockStart, setBlockStart] = useState('09:00');
  const [blockEnd, setBlockEnd] = useState('17:00');
  const [bufferMinutes, setBufferMinutes] = useState('0');
  const [times, setTimes] = useState<string[]>([]);

  const existingByDate = useMemo(() => {
    return new Map(existingDays.map((d) => [d.date, d]));
  }, [existingDays]);

  const selectedService = serviceOptions.find((opt) => opt.value === sessionTypeId);
  const effectiveDuration = Number(durationMinutes) || selectedService?.durationMinutes || 60;

  const calendarDays = useMemo(() => {
    const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const end = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    const leading = start.getDay();
    const cells: Array<{ key: string; date: Date | null }> = [];
    for (let i = 0; i < leading; i += 1) {
      cells.push({ key: `empty-start-${i}`, date: null });
    }
    for (let day = 1; day <= end.getDate(); day += 1) {
      cells.push({
        key: `day-${day}`,
        date: new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day),
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ key: `empty-end-${cells.length}`, date: null });
    }
    return cells;
  }, [monthCursor]);

  function generateBlocks(startValue = blockStart, endValue = blockEnd) {
    if (effectiveDuration < 15) return;
    const start = timeToMinutes(startValue);
    const end = timeToMinutes(endValue);
    const buffer = Number(bufferMinutes) || 0;
    if (end <= start) return;

    const generated: string[] = [];
    for (let cursor = start; cursor + effectiveDuration <= end; cursor += effectiveDuration + buffer) {
      generated.push(minutesToTime(cursor));
    }
    setTimes((prev) => Array.from(new Set([...prev, ...generated])).sort());
  }

  function applyPreset(start: string, end: string) {
    setBlockStart(start);
    setBlockEnd(end);
    generateBlocks(start, end);
  }

  return (
    <form action={formAction} className="grid grid-cols-12 gap-10">
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-3">Step 1 · Pick a date</p>
          <div className="border border-mist">
            <div className="flex items-center justify-between px-4 py-3 border-b border-mist">
              <button
                type="button"
                className="text-t-12 eyebrow-label text-ash hover:text-accent"
                onClick={() =>
                  setMonthCursor(
                    new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1),
                  )
                }
              >
                ← Prev
              </button>
              <p className="font-serif text-t-22">{monthLabel(monthCursor)}</p>
              <button
                type="button"
                className="text-t-12 eyebrow-label text-ash hover:text-accent"
                onClick={() =>
                  setMonthCursor(
                    new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1),
                  )
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
                const dateValue = toDateInput(cell.date);
                const info = existingByDate.get(dateValue);
                const selected = selectedDay === dateValue;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDay(dateValue)}
                    className={`h-16 border-r border-b border-mist/60 px-2 text-left transition-colors ${
                      selected ? 'bg-ink text-bone' : info?.activeCount ? 'bg-mist/50 hover:bg-mist' : 'hover:bg-mist/30'
                    }`}
                  >
                    <span className="block text-t-14">{cell.date.getDate()}</span>
                    {info?.activeCount ? (
                      <span className={`block text-[11px] ${selected ? 'text-bone/80' : 'text-ash'}`}>
                        {info.activeCount} slot{info.activeCount === 1 ? '' : 's'}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
          <input name="day" value={selectedDay} readOnly hidden />
          {selectedDay ? (
            <p className="text-t-12 text-ash mt-3">
              Selected date: {new Date(`${selectedDay}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          ) : (
            <p className="text-t-12 text-ash mt-3">Select a date to continue.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-ash text-t-12 eyebrow-label mb-3">Session type</label>
            <select
              name="session_type_id"
              required
              value={sessionTypeId}
              onChange={(e) => setSessionTypeId(e.target.value)}
              className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-16 outline-none font-light"
            >
              <option value="">{hasServices ? 'Select…' : 'No session types found'}</option>
              {serviceOptions.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
            <p className="text-t-12 text-ash mt-2 font-light italic">
              {hasServices
                ? 'Choose from your existing session types. Only one can be active per day.'
                : 'Create a session type first, then return here to publish slots.'}
            </p>
            {!hasServices && (
              <p className="text-t-12 mt-2">
                <a href="/admin/services/new" className="underline hover:text-accent">
                  Go to session types →
                </a>
              </p>
            )}
          </div>

          <div />
        </div>

        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-3">Step 2 · Build time blocks</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-ash text-t-12 eyebrow-label mb-2">Start</label>
              <input
                type="time"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
                className="w-full bg-transparent border-b border-ink/30 py-2 text-t-16 outline-none"
              />
            </div>
            <div>
              <label className="block text-ash text-t-12 eyebrow-label mb-2">End</label>
              <input
                type="time"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
                className="w-full bg-transparent border-b border-ink/30 py-2 text-t-16 outline-none"
              />
            </div>
            <div>
              <label className="block text-ash text-t-12 eyebrow-label mb-2">Duration (min)</label>
              <input
                name="duration_minutes"
                type="number"
                min={15}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder={String(selectedService?.durationMinutes ?? 60)}
                className="w-full bg-transparent border-b border-ink/30 py-2 text-t-16 outline-none"
              />
            </div>
            <div>
              <label className="block text-ash text-t-12 eyebrow-label mb-2">Buffer (min)</label>
              <input
                type="number"
                min={0}
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(e.target.value)}
                className="w-full bg-transparent border-b border-ink/30 py-2 text-t-16 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <button
              type="button"
              disabled={!hasServices}
              onClick={() => generateBlocks()}
              className="text-t-12 eyebrow-label border border-ink px-3 py-2 hover:bg-ink hover:text-bone transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-inherit"
            >
              Add block schedule
            </button>
            <button
              type="button"
              disabled={!hasServices}
              onClick={() => applyPreset('09:00', '17:00')}
              className="text-t-12 eyebrow-label border border-mist px-3 py-2 hover:border-ink transition-colors disabled:opacity-50"
            >
              Quick fill 9a–5p
            </button>
            <button
              type="button"
              disabled={!hasServices}
              onClick={() => applyPreset('09:00', '12:00')}
              className="text-t-12 eyebrow-label border border-mist px-3 py-2 hover:border-ink transition-colors disabled:opacity-50"
            >
              Quick fill morning
            </button>
            <button
              type="button"
              onClick={() => setTimes([])}
              className="text-t-12 eyebrow-label text-ash hover:text-accent"
            >
              Clear times
            </button>
            <p className="text-t-12 text-ash">
              Uses {effectiveDuration} minute sessions
              {(Number(bufferMinutes) || 0) > 0 ? ` + ${bufferMinutes} minute buffer` : ''}.
            </p>
          </div>

          <input name="times" value={times.join(',')} readOnly hidden />
          <div className="mt-5 border-t border-mist pt-4">
            <p className="text-ash text-t-12 eyebrow-label mb-3">Published times</p>
            {times.length === 0 ? (
              <p className="text-t-14 text-ash font-light italic">No time blocks added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {times.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setTimes((prev) => prev.filter((value) => value !== time))}
                    className="inline-flex items-center gap-2 border border-mist px-3 py-2 text-t-14 hover:border-ink"
                  >
                    {new Date(`1970-01-01T${time}:00`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    <span className="text-ash">x</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-ash text-t-12 eyebrow-label mb-3">Price (USD, optional)</label>
            <input
              name="price_dollars"
              type="number"
              step="1"
              value={priceDollars}
              onChange={(e) => setPriceDollars(e.target.value)}
              className="w-full bg-transparent border-b border-ink/30 py-3 text-t-16 outline-none font-light"
            />
          </div>
          <div>
            <label className="block text-ash text-t-12 eyebrow-label mb-3">Location</label>
            <input
              name="location_label"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              className="w-full bg-transparent border-b border-ink/30 py-3 text-t-16 outline-none font-light"
            />
          </div>
        </div>

        <div>
          <label className="block text-ash text-t-12 eyebrow-label mb-3">Internal notes</label>
          <textarea
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-transparent border-b border-ink/30 py-3 text-t-16 outline-none resize-none font-light"
          />
        </div>

        <FormError message={state.error} />
        <FormSaved visible={state.saved} />

        <div className="pt-4">
          <button
            type="submit"
            disabled={pending || !hasServices}
            className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-300 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Publish day availability →'}
          </button>
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-4">
        <p className="text-ash text-t-12 eyebrow-label">How this works</p>
        <ul className="space-y-3 text-t-14 text-ash font-light">
          <li>Pick a date from the calendar first.</li>
          <li>Choose the session type from your existing list.</li>
          <li>Use block scheduling or quick-fill, then remove specific times with x.</li>
          <li>You can set any session duration and optional buffer between blocks.</li>
          <li>Publishing creates one bookable slot per remaining time.</li>
        </ul>

        {selectedDay && existingByDate.get(selectedDay) ? (
          <div className="border border-mist p-4 mt-4">
            <p className="text-t-12 eyebrow-label text-ash mb-2">Current day setup</p>
            <p className="font-serif text-t-18">{existingByDate.get(selectedDay)!.sessionName}</p>
            <p className="text-t-12 text-ash mt-1">
              {existingByDate.get(selectedDay)!.activeCount} active slot
              {existingByDate.get(selectedDay)!.activeCount === 1 ? '' : 's'}
            </p>
          </div>
        ) : null}
      </aside>
    </form>
  );
}
