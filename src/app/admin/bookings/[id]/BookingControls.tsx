'use client';

import { useState, useTransition } from 'react';
import { setStage, setNotes, cancelBooking } from '../actions';
import type { Database } from '@/lib/supabase/database.types';

type Stage = Database['public']['Enums']['pipeline_stage'];

const NEXT_STAGES: Record<Stage, Stage[]> = {
  booked: ['shoot_scheduled', 'cancelled'],
  shoot_scheduled: ['shoot_complete', 'cancelled'],
  shoot_complete: ['editing'],
  editing: ['delivered'],
  delivered: ['archived'],
  archived: [],
  cancelled: [],
};

export function BookingControls({
  bookingId,
  stage,
  notes,
  depositCents,
}: {
  bookingId: string;
  stage: Stage;
  notes: string;
  depositCents: number;
}) {
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(notes);
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className="space-y-10">
      <section>
        <p className="text-ash text-t-12 eyebrow-label mb-4">Pipeline</p>
        <p className="font-serif text-t-28 capitalize mb-4">{stage.replace('_', ' ')}</p>
        <div className="flex flex-wrap gap-2">
          {NEXT_STAGES[stage].map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await setStage(bookingId, s);
                })
              }
              className="text-t-12 eyebrow-label border border-ink px-3 py-2 hover:bg-ink hover:text-bone disabled:opacity-50"
            >
              → {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-ash text-t-12 eyebrow-label mb-4">Internal notes</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          className="w-full bg-transparent border border-mist focus:border-ink p-3 text-t-14 outline-none font-light"
        />
        <button
          type="button"
          disabled={pending || draft === notes}
          onClick={() =>
            start(async () => {
              await setNotes(bookingId, draft);
            })
          }
          className="mt-3 text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent disabled:opacity-50"
        >
          Save notes
        </button>
      </section>

      {stage !== 'cancelled' && stage !== 'archived' && (
        <section className="border-t border-mist pt-10">
          <p className="text-ash text-t-12 eyebrow-label mb-4">Cancel</p>
          {!showCancel ? (
            <button
              type="button"
              onClick={() => setShowCancel(true)}
              className="text-t-12 eyebrow-label text-red-700 hover:underline"
            >
              Open cancellation
            </button>
          ) : (
            <CancelForm
              bookingId={bookingId}
              depositCents={depositCents}
              pending={pending}
              start={start}
              onClose={() => setShowCancel(false)}
            />
          )}
        </section>
      )}
    </div>
  );
}

function CancelForm({
  bookingId,
  depositCents,
  pending,
  start,
  onClose,
}: {
  bookingId: string;
  depositCents: number;
  pending: boolean;
  start: (fn: () => void) => void;
  onClose: () => void;
}) {
  const [by, setBy] = useState<'customer' | 'studio'>('customer');
  const [refund, setRefund] = useState<'forfeit' | 'credit_full' | 'credit_custom'>('credit_full');
  const [reason, setReason] = useState('');
  const [customDollars, setCustomDollars] = useState((depositCents / 100).toString());

  return (
    <div className="space-y-4 border border-mist p-4 bg-vellum/30">
      <div className="flex gap-4 text-t-12 eyebrow-label">
        <label>
          <input
            type="radio"
            name="by"
            value="customer"
            checked={by === 'customer'}
            onChange={() => setBy('customer')}
            className="mr-2"
          />
          Customer-initiated
        </label>
        <label>
          <input
            type="radio"
            name="by"
            value="studio"
            checked={by === 'studio'}
            onChange={() => {
              setBy('studio');
              setRefund('credit_full');
            }}
            className="mr-2"
          />
          Studio-initiated
        </label>
      </div>

      {by === 'customer' && (
        <div className="flex gap-4 text-t-12 eyebrow-label">
          <label>
            <input
              type="radio"
              name="refund"
              checked={refund === 'credit_full'}
              onChange={() => setRefund('credit_full')}
              className="mr-2"
            />
            ≥48h: full credit
          </label>
          <label>
            <input
              type="radio"
              name="refund"
              checked={refund === 'forfeit'}
              onChange={() => setRefund('forfeit')}
              className="mr-2"
            />
            &lt;48h: forfeit
          </label>
          <label>
            <input
              type="radio"
              name="refund"
              checked={refund === 'credit_custom'}
              onChange={() => setRefund('credit_custom')}
              className="mr-2"
            />
            Custom credit
          </label>
        </div>
      )}

      {refund === 'credit_custom' && by === 'customer' && (
        <input
          type="number"
          min="0"
          step="1"
          value={customDollars}
          onChange={(e) => setCustomDollars(e.target.value)}
          className="w-full bg-transparent border-b border-ink/30 py-2 text-t-14 outline-none"
          placeholder="Credit (USD)"
        />
      )}

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Reason"
        className="w-full bg-transparent border border-mist p-2 text-t-14 outline-none font-light"
      />

      <div className="flex gap-6">
        <button
          type="button"
          disabled={pending || !reason.trim()}
          onClick={() =>
            start(async () => {
              await cancelBooking({
                bookingId,
                by,
                reason: reason.trim(),
                refund,
                customCreditCents:
                  refund === 'credit_custom' ? Math.round(Number(customDollars) * 100) : undefined,
              });
              onClose();
            })
          }
          className="text-t-12 eyebrow-label text-red-700 border-b border-red-700 pb-1 hover:underline disabled:opacity-50"
        >
          Confirm cancellation
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-t-12 eyebrow-label text-ash hover:text-ink"
        >
          Never mind
        </button>
      </div>
    </div>
  );
}
