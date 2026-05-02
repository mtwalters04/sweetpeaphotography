'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function CheckoutButton({
  slotId,
  signedIn,
  paymentsConfigured,
}: {
  slotId: string;
  signedIn: boolean;
  paymentsConfigured: boolean;
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

  if (!paymentsConfigured) {
    return (
      <p className="text-t-14 text-ash italic font-light">
        Payments are being wired up. Once Stripe is connected, this slot will be bookable here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
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
              if (!res.ok || !json.url) {
                setError(json.error ?? 'Checkout failed');
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
        <span>{pending ? 'Holding the date…' : 'Book — pay 30% deposit'}</span>
        <span aria-hidden>→</span>
      </button>
      {error && <p role="alert" className="text-t-14 text-red-700">{error}</p>}
    </div>
  );
}
