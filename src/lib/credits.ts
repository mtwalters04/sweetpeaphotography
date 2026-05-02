/** US card payments through Stripe Checkout have a nonzero minimum charge. */
export const STRIPE_CARD_MINIMUM_CENTS_USD = 50;

/**
 * Decide how much deposit is covered by studio credit vs charged on Stripe.
 * When a card charge is required, it is always at least {@link STRIPE_CARD_MINIMUM_CENTS_USD}.
 */
export function planDepositSplit(depositCents: number, balanceCents: number) {
  if (depositCents <= 0) {
    throw new Error('Invalid deposit');
  }

  const naiveCredit = Math.min(balanceCents, depositCents);
  let remainder = depositCents - naiveCredit;

  if (remainder === 0) {
    return { creditAppliedCents: naiveCredit, stripeChargeCents: 0 };
  }

  if (remainder < STRIPE_CARD_MINIMUM_CENTS_USD) {
    const creditIfMinCard = depositCents - STRIPE_CARD_MINIMUM_CENTS_USD;
    if (creditIfMinCard >= 0 && creditIfMinCard <= balanceCents) {
      return {
        creditAppliedCents: creditIfMinCard,
        stripeChargeCents: STRIPE_CARD_MINIMUM_CENTS_USD,
      };
    }
    if (balanceCents >= depositCents) {
      return { creditAppliedCents: depositCents, stripeChargeCents: 0 };
    }
  }

  const out = { creditAppliedCents: naiveCredit, stripeChargeCents: remainder };
  if (
    out.stripeChargeCents > 0 &&
    out.stripeChargeCents < STRIPE_CARD_MINIMUM_CENTS_USD
  ) {
    if (balanceCents >= depositCents) {
      return { creditAppliedCents: depositCents, stripeChargeCents: 0 };
    }
    throw new Error('STRIPE_MINIMUM_BLOCKED');
  }
  return out;
}
