// All money in cents internally. Format on the boundary.

export const formatUsd = (cents: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

export const dollarsToCents = (dollars: number | string): number => {
  const n = typeof dollars === 'number' ? dollars : Number.parseFloat(dollars);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
};

export const computeDeposit = (amountCents: number, depositPct: number): number =>
  Math.round(amountCents * depositPct);
