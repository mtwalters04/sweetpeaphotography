'use client';

import { useActionState, useTransition } from 'react';
import {
  Field,
  Select,
  FormError,
  FormSaved,
  SubmitButton,
} from '../_components/AdminForm';
import { type State, deleteSlot, setSlotStatus } from './actions';

const initial: State = { error: null, saved: false };

export type SlotInitial = {
  id: string | null;
  session_type_id: string;
  photographer_id: string;
  starts_at_local: string; // datetime-local format
  duration_minutes: number;
  price_dollars: number;
  location_label: string;
  notes: string;
  status: 'open' | 'held' | 'booked' | 'cancelled';
  isPrivate: boolean;
};

export function SlotForm({
  slot,
  serviceOptions,
  photographerOptions,
  action,
  submitLabel,
}: {
  slot: SlotInitial;
  serviceOptions: readonly { value: string; label: string }[];
  photographerOptions: readonly { value: string; label: string }[];
  action: (prev: State, fd: FormData) => Promise<State>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [delPending, startDel] = useTransition();
  const [statusPending, startStatus] = useTransition();

  const editingDisabled = slot.status === 'booked';

  return (
    <form action={formAction} className="grid grid-cols-12 gap-10">
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <Select
          label="Service"
          name="session_type_id"
          defaultValue={slot.session_type_id}
          options={serviceOptions}
          required
        />
        <Select
          label="Photographer"
          name="photographer_id"
          defaultValue={slot.photographer_id}
          options={photographerOptions}
        />
        <Field
          label="Starts at"
          name="starts_at"
          type="datetime-local"
          defaultValue={slot.starts_at_local}
          required
        />
        <Field
          label="Duration (minutes, optional override)"
          name="duration_minutes"
          type="number"
          min="15"
          defaultValue={slot.duration_minutes || ''}
          hint="Leave blank to inherit from the service."
        />
        <Field
          label="Price (USD, optional override)"
          name="price_dollars"
          type="number"
          step="1"
          defaultValue={slot.price_dollars || ''}
          hint="Leave blank to inherit from the service."
        />
        <Field
          label="Location"
          name="location_label"
          defaultValue={slot.location_label}
          hint="Visible to customers."
        />
        <Field
          label="Internal notes"
          name="notes"
          defaultValue={slot.notes}
          textarea
          rows={3}
          hint="Not shown to customers."
        />

        <FormError message={state.error} />
        <FormSaved visible={state.saved} />

        <div className="flex items-center gap-10 pt-4">
          <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
          {slot.id && !editingDisabled && (
            <button
              type="button"
              disabled={delPending}
              onClick={() => {
                if (confirm('Delete this slot?')) {
                  startDel(async () => {
                    await deleteSlot(slot.id!);
                  });
                }
              }}
              className="text-t-12 eyebrow-label text-red-700 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-8">
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-3">Status</p>
          <p className="font-serif text-t-28 capitalize">{slot.status}</p>
          {slot.isPrivate && (
            <p className="text-t-12 eyebrow-label text-ash mt-2">Private — quoted to one customer</p>
          )}
          {slot.id && slot.status !== 'booked' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {slot.status === 'cancelled' ? (
                <button
                  type="button"
                  disabled={statusPending}
                  onClick={() =>
                    startStatus(async () => {
                      await setSlotStatus(slot.id!, 'open');
                    })
                  }
                  className="text-t-12 eyebrow-label border border-ink px-3 py-2 hover:bg-ink hover:text-bone"
                >
                  Reopen
                </button>
              ) : (
                <button
                  type="button"
                  disabled={statusPending}
                  onClick={() =>
                    startStatus(async () => {
                      await setSlotStatus(slot.id!, 'cancelled');
                    })
                  }
                  className="text-t-12 eyebrow-label border border-ink px-3 py-2 hover:bg-ink hover:text-bone"
                >
                  Cancel slot
                </button>
              )}
            </div>
          )}
          {editingDisabled && (
            <p className="text-t-12 text-ash mt-3 italic">
              Slot is booked — go to the booking to make changes.
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}
