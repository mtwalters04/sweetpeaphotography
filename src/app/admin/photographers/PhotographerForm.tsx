'use client';

import { useActionState } from 'react';
import { useTransition } from 'react';
import {
  Field,
  FormError,
  FormSaved,
  SubmitButton,
} from '../_components/AdminForm';
import { type State, deletePhotographer } from './actions';

const initial: State = { error: null, saved: false };

export type PhotographerInitial = {
  id: string | null;
  public_name: string;
  public_bio: string;
  order_index: number;
  active: boolean;
};

export function PhotographerForm({
  photographer,
  action,
  submitLabel,
}: {
  photographer: PhotographerInitial;
  action: (prev: State, fd: FormData) => Promise<State>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [deletePending, startDelete] = useTransition();

  return (
    <form action={formAction} className="space-y-8 max-w-prose">
      <Field
        label="Public name"
        name="public_name"
        defaultValue={photographer.public_name}
        required
      />
      <Field
        label="Public bio"
        name="public_bio"
        defaultValue={photographer.public_bio}
        textarea
        rows={4}
      />
      <Field
        label="Order index"
        name="order_index"
        type="number"
        defaultValue={photographer.order_index}
        hint="Lower shows first."
      />
      <Field label="Active" name="active" type="checkbox" defaultChecked={photographer.active} />

      <FormError message={state.error} />
      <FormSaved visible={state.saved} />

      <div className="flex items-center gap-10 pt-4">
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        {photographer.id && (
          <button
            type="button"
            disabled={deletePending}
            onClick={() => {
              if (confirm('Delete this photographer?')) {
                startDelete(async () => {
                  await deletePhotographer(photographer.id!);
                });
              }
            }}
            className="text-t-12 eyebrow-label text-red-700 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
