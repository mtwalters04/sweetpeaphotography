'use client';

import { useActionState } from 'react';
import { issueCredit, updateCustomer, type State } from '../actions';

const initial: State = { error: null, saved: false };

type CrmInitial = {
  lifecycle_stage: string;
  tags: string;
  internal_notes: string;
  last_contact_at_local: string; // YYYY-MM-DDTHH:mm
};

export function CrmForm({
  customerId,
  initial: data,
}: {
  customerId: string;
  initial: CrmInitial;
}) {
  const action = updateCustomer.bind(null, customerId) as unknown as (
    p: State,
    fd: FormData,
  ) => Promise<State>;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6">
      <SimpleSelect
        label="Lifecycle stage"
        name="lifecycle_stage"
        defaultValue={data.lifecycle_stage}
        options={[
          { value: '', label: 'Unset' },
          { value: 'lead', label: 'Lead' },
          { value: 'active', label: 'Active' },
          { value: 'past_client', label: 'Past client' },
          { value: 'dormant', label: 'Dormant' },
        ]}
      />
      <SimpleField
        label="Tags (comma-separated)"
        name="tags"
        defaultValue={data.tags}
      />
      <SimpleField
        label="Last contact"
        name="last_contact_at"
        type="datetime-local"
        defaultValue={data.last_contact_at_local}
      />
      <SimpleField
        label="Internal notes"
        name="internal_notes"
        defaultValue={data.internal_notes}
        textarea
      />
      {state.error && <p className="text-t-14 text-red-700">{state.error}</p>}
      {state.saved && <p className="text-t-14 text-ink">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save →'}
      </button>
    </form>
  );
}

export function IssueCreditForm({ customerId }: { customerId: string }) {
  const action = issueCredit.bind(null, customerId) as unknown as (
    p: State,
    fd: FormData,
  ) => Promise<State>;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      <SimpleField label="Amount (USD)" name="amount_dollars" type="number" required />
      <SimpleField label="Reason / notes" name="notes" textarea />
      {state.error && <p className="text-t-14 text-red-700">{state.error}</p>}
      {state.saved && <p className="text-t-14 text-ink">Issued.</p>}
      <button
        type="submit"
        disabled={pending}
        className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent disabled:opacity-50"
      >
        {pending ? 'Issuing…' : 'Issue credit →'}
      </button>
    </form>
  );
}

function SimpleField({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 eyebrow-label mb-3">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue}
          rows={3}
          className="w-full bg-transparent border border-mist focus:border-ink p-3 text-t-14 outline-none font-light"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-14 outline-none font-light"
        />
      )}
    </div>
  );
}

function SimpleSelect({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 eyebrow-label mb-3">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-14 outline-none font-light"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
