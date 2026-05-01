'use client';

import { useActionState, useTransition } from 'react';
import {
  Field,
  FormError,
  FormSaved,
  SubmitButton,
} from '../_components/AdminForm';
import { type State, deleteService } from './actions';

const initial: State = { error: null, saved: false };

export type ServiceInitial = {
  id: string | null;
  slug: string;
  name: string;
  eyebrow: string;
  summary: string;
  description: string;
  duration_minutes: number;
  starting_at_dollars: number;
  deposit_pct: number;
  includes: string;
  order_index: number;
  active: boolean;
};

export function ServiceForm({
  service,
  action,
  submitLabel,
}: {
  service: ServiceInitial;
  action: (prev: State, fd: FormData) => Promise<State>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [delPending, startDel] = useTransition();

  return (
    <form action={formAction} className="grid grid-cols-12 gap-10">
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <Field label="Name" name="name" defaultValue={service.name} required />
        <Field label="Slug" name="slug" defaultValue={service.slug} required />
        <Field label="Eyebrow" name="eyebrow" defaultValue={service.eyebrow} />
        <Field label="Summary" name="summary" defaultValue={service.summary} textarea rows={2} />
        <Field
          label="Description"
          name="description"
          defaultValue={service.description}
          textarea
          rows={6}
        />
        <Field
          label="Includes (one per line)"
          name="includes"
          defaultValue={service.includes}
          textarea
          rows={6}
        />
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-8">
        <Field
          label="Starting price (USD)"
          name="starting_at_dollars"
          type="number"
          step="1"
          min="0"
          defaultValue={service.starting_at_dollars}
          required
        />
        <Field
          label="Duration (minutes)"
          name="duration_minutes"
          type="number"
          min="15"
          defaultValue={service.duration_minutes}
        />
        <Field
          label="Deposit fraction"
          name="deposit_pct"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={service.deposit_pct}
          hint="e.g. 0.30 for 30%"
        />
        <Field
          label="Order index"
          name="order_index"
          type="number"
          defaultValue={service.order_index}
        />
        <Field label="Active" name="active" type="checkbox" defaultChecked={service.active} />

        <FormError message={state.error} />
        <FormSaved visible={state.saved} />

        <div className="flex items-center gap-10 pt-4">
          <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
          {service.id && (
            <button
              type="button"
              disabled={delPending}
              onClick={() => {
                if (confirm('Delete service?')) {
                  startDel(async () => {
                    await deleteService(service.id!);
                  });
                }
              }}
              className="text-t-12 eyebrow-label text-red-700 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </aside>
    </form>
  );
}
