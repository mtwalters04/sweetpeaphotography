// Centralized env access. Each getter throws if its value is missing so a
// missing key fails loudly at the point of first use, not silently.

const optional = (name: string): string | undefined => {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
};

/** Values you can keep in .env until real keys exist — they are treated as "not configured". */
const isPlaceholderToken = (v: string) => {
  const t = v.trim().toLowerCase();
  return t === 'placeholder' || t === 'unset' || t === 'pending' || t === 'your_key_here';
};

const required = (name: string): string => {
  const v = optional(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
};

export const env = {
  // Booleans for "is this service configured" — used by UI to gracefully degrade.
  hasStripe: () => {
    const k = optional('STRIPE_SECRET_KEY');
    return !!k && !isPlaceholderToken(k);
  },
  hasResend: () => !!optional('RESEND_API_KEY'),
  hasR2: () => {
    const a = optional('R2_ACCOUNT_ID');
    const ak = optional('R2_ACCESS_KEY_ID');
    const sk = optional('R2_SECRET_ACCESS_KEY');
    return (
      !!a &&
      !!ak &&
      !!sk &&
      !isPlaceholderToken(a) &&
      !isPlaceholderToken(ak) &&
      !isPlaceholderToken(sk)
    );
  },

  stripeSecret: () => required('STRIPE_SECRET_KEY'),
  /** Only needed for future client-side Stripe Elements / embedded checkout. */
  stripePublishableOptional: () => optional('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  stripeWebhookSecret: () => required('STRIPE_WEBHOOK_SECRET'),

  resendApiKey: () => required('RESEND_API_KEY'),
  resendFromEmail: () => optional('RESEND_FROM_EMAIL') ?? 'Sweet Pea Photography <onboarding@resend.dev>',

  r2AccountId: () => required('R2_ACCOUNT_ID'),
  r2AccessKeyId: () => required('R2_ACCESS_KEY_ID'),
  r2SecretAccessKey: () => required('R2_SECRET_ACCESS_KEY'),
  r2Bucket: () => optional('R2_BUCKET') ?? 'sweetpea-dev',
  r2Endpoint: () => required('R2_ENDPOINT'),
  r2PublicBaseUrl: () => optional('R2_PUBLIC_BASE_URL'),

  siteUrl: () => optional('NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000',
  cronSecret: () => optional('CRON_SECRET') ?? '',

  studioNotificationEmail: () =>
    optional('STUDIO_NOTIFICATION_EMAIL') ?? 'mtwalters04@gmail.com',
};
