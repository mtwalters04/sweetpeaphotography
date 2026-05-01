'use client';

import { useTransition } from 'react';
import { withdrawRequest } from '../actions';

export function WithdrawButton({ requestId }: { requestId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm('Withdraw this request?')) {
          start(async () => {
            await withdrawRequest(requestId);
          });
        }
      }}
      className="text-t-12 eyebrow-label text-ash hover:text-red-700 transition-colors"
    >
      {pending ? 'Withdrawing…' : 'Withdraw request'}
    </button>
  );
}
