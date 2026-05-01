import Stripe from 'stripe';
import { env } from './env';

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  cached = new Stripe(env.stripeSecret(), {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
  });
  return cached;
}
