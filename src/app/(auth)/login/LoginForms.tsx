'use client';

import { useActionState, useState } from 'react';
import { signInWithPassword, signInWithMagicLink, type AuthState } from '../actions';
import { FormField, SubmitButton } from '../AuthShell';

const initial: AuthState = { error: null };

export function LoginForms({ next }: { next: string }) {
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [pwState, pwAction, pwPending] = useActionState(signInWithPassword, initial);
  const [mlState, mlAction, mlPending] = useActionState(signInWithMagicLink, initial);

  return (
    <div>
      <div className="flex border-b border-mist mb-8 text-t-12 uppercase tracking-[0.2em]">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`pb-3 mr-8 ${mode === 'password' ? 'border-b-2 border-ink -mb-px text-ink' : 'text-ash hover:text-ink'}`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`pb-3 ${mode === 'magic' ? 'border-b-2 border-ink -mb-px text-ink' : 'text-ash hover:text-ink'}`}
        >
          Magic link
        </button>
      </div>

      {mode === 'password' ? (
        <form action={pwAction} className="space-y-6">
          <input type="hidden" name="next" value={next} />
          <FormField label="Email" name="email" type="email" autoComplete="email" required />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          {pwState.error && <p role="alert" className="text-t-14 text-red-700">{pwState.error}</p>}
          <SubmitButton pending={pwPending}>Sign in</SubmitButton>
        </form>
      ) : (
        <form action={mlAction} className="space-y-6">
          <FormField label="Email" name="email" type="email" autoComplete="email" required />
          {mlState.error && <p role="alert" className="text-t-14 text-red-700">{mlState.error}</p>}
          {mlState.message && <p className="text-t-14 text-ink">{mlState.message}</p>}
          <SubmitButton pending={mlPending}>Send sign-in link</SubmitButton>
          <p className="text-t-12 text-ash">
            We will send you a one-time link. No password required.
          </p>
        </form>
      )}
    </div>
  );
}
