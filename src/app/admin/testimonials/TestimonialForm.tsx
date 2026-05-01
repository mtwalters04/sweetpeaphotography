'use client';

import { useActionState, useTransition } from 'react';
import {
  Field,
  FormError,
  FormSaved,
  SubmitButton,
} from '../_components/AdminForm';
import { type State, deleteTestimonial } from './actions';

const initial: State = { error: null, saved: false };

export type TestimonialInitial = {
  id: string | null;
  quote: string;
  attribution: string;
  context: string;
  featured: boolean;
  approved: boolean;
  order_index: number;
};

export function TestimonialForm({
  testimonial,
  action,
  submitLabel,
}: {
  testimonial: TestimonialInitial;
  action: (prev: State, fd: FormData) => Promise<State>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [delPending, startDel] = useTransition();

  return (
    <form action={formAction} className="space-y-8 max-w-prose">
      <Field
        label="Quote"
        name="quote"
        defaultValue={testimonial.quote}
        textarea
        rows={5}
        required
      />
      <Field label="Attribution" name="attribution" defaultValue={testimonial.attribution} required />
      <Field label="Context" name="context" defaultValue={testimonial.context} />
      <Field
        label="Order index"
        name="order_index"
        type="number"
        defaultValue={testimonial.order_index}
      />
      <Field label="Featured" name="featured" type="checkbox" defaultChecked={testimonial.featured} />
      <Field label="Approved (visible to public)" name="approved" type="checkbox" defaultChecked={testimonial.approved} />

      <FormError message={state.error} />
      <FormSaved visible={state.saved} />

      <div className="flex items-center gap-10 pt-4">
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        {testimonial.id && (
          <button
            type="button"
            disabled={delPending}
            onClick={() => {
              if (confirm('Delete this testimonial?')) {
                startDel(async () => {
                  await deleteTestimonial(testimonial.id!);
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
