'use client';

import { useActionState } from 'react';
import { signUpWithPassword, type AuthState } from '../actions';
import { FormField, SubmitButton } from '../AuthShell';

const initial: AuthState = { error: null };

export function SignupForm() {
  const [state, action, pending] = useActionState(signUpWithPassword, initial);

  return (
    <form action={action} className="space-y-6">
      <FormField label="Full name" name="full_name" autoComplete="name" required />
      <FormField label="Email" name="email" type="email" autoComplete="email" required />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />
      {state.error && <p role="alert" className="text-t-14 text-red-700">{state.error}</p>}
      {state.message && <p className="text-t-14 text-ink">{state.message}</p>}
      <SubmitButton pending={pending}>Create account</SubmitButton>
      <p className="text-t-12 text-ash">
        By creating an account you agree to receive booking-related email from Sweet Pea Photography.
      </p>
    </form>
  );
}
