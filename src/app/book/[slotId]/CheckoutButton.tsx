'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function CheckoutButton({
  slotId,
  signedIn,
  stripeConfigured,
  canBook,
  creditCoversFullDeposit,
  depositCents,
  balanceCents,
}: {
  slotId: string;
  signedIn: boolean;
  stripeConfigured: boolean;
  canBook: boolean;
  creditCoversFullDeposit: boolean;
  depositCents: number;
  balanceCents: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/login?next=/book/${slotId}`)}
        className="inline-flex items-center gap-3 text-t-12 uppercase tracking-[0.18em] text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-500 min-h-[44px]"
      >
        <span>Sign in to book</span>
        <span aria-hidden>→</span>
      </button>
    );
  }

  if (!canBook) {
    return (
      <div className="space-y-3 text-t-14 text-ash font-light italic">
        <p>
          {stripeConfigured
            ? 'This slot cannot be booked with your current studio credit and payment settings. Refresh the page or contact the studio.'
            : 'Connecting a card processor is still in progress. Once your account credit covers the full deposit, you can confirm here without a card.'}
        </p>
      </div>
    );
  }

  const labelCreditOnly =
    creditCoversFullDeposit && !stripeConfigured
      ? 'Confirm with studio credit'
      : creditCoversFullDeposit && stripeConfigured
        ? 'Continue — credit covers deposit'
        : 'Book — pay deposit';

  return (
    <div className="space-y-5">
      {creditCoversFullDeposit && (
        <p className="text-t-14 font-light text-ink">
          Your studio credit balance covers this {(depositCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} deposit
          {!stripeConfigured ? ' — no card charge.' : '.'}
          {' '}({(balanceCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} available)
        </p>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            try {
              const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ slot_id: slotId }),
              });
              const json = await res.json();
              if (!res.ok) {
                setError(json.error ?? 'Checkout failed');
                return;
              }
              if (json.credit_only) {
                const r2 = await fetch('/api/booking/confirm-credit', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ slot_id: slotId }),
                });
                const j2 = await r2.json();
                if (!r2.ok || !j2.redirect_url) {
                  setError(j2.error ?? 'Could not confirm with credit');
                  return;
                }
                window.location.href = j2.redirect_url;
                return;
              }
              if (!json.url) {
                setError('Checkout failed');
                return;
              }
              window.location.href = json.url;
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Network error');
            }
          })
        }
        className="inline-flex items-center gap-3 text-t-12 uppercase tracking-[0.18em] text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-500 min-h-[44px] disabled:opacity-60"
      >
        <span>{pending ? 'Working…' : labelCreditOnly}</span>
        <span aria-hidden>→</span>
      </button>
      {error && (
        <p role="alert" className="text-t-14 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
