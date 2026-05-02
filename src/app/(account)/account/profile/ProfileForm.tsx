'use client';

import { useActionState } from 'react';
import { updateProfile, type ProfileState } from './actions';

const initial: ProfileState = { error: null, saved: false };

export function ProfileForm({
  initialFullName,
  initialPhone,
  email,
}: {
  initialFullName: string;
  initialPhone: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(updateProfile, initial);

  return (
    <form action={action} className="space-y-8 max-w-prose">
      <div>
        <label className="block text-ash text-t-12 uppercase tracking-[0.2em] mb-3">Email</label>
        <p className="text-t-16 text-ash">{email}</p>
        <p className="text-t-12 text-ash mt-1">
          To change your email, contact us. (Self-serve change lands later.)
        </p>
      </div>

      <Field label="Full name" name="full_name" defaultValue={initialFullName} />
      <Field label="Phone" name="phone" type="tel" defaultValue={initialPhone} />

      {state.error && <p role="alert" className="text-t-14 text-red-700">{state.error}</p>}
      {state.saved && <p className="text-t-14 text-ink">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="text-t-14 text-bone bg-ink px-6 py-3 hover:bg-accent transition-colors disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 uppercase tracking-[0.2em] mb-3">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-16 outline-none"
      />
    </div>
  );
}
