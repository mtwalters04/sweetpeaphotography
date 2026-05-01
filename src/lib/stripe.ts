import Stripe from 'stripe';
import { env } from './env';

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  // Pinned to the version the installed SDK was generated against.
  cached = new Stripe(env.stripeSecret(), {
    apiVersion: '2026-04-22.dahlia',
  });
  return cached;
}
