import { Resend } from 'resend';
import { env } from './env';

let cached: Resend | null = null;

function getResend(): Resend {
  if (cached) return cached;
  cached = new Resend(env.resendApiKey());
  return cached;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
};

// Resilient send wrapper. In dev or when Resend is not configured, logs and
// returns success so feature code never has to branch on `hasResend`.
export async function sendEmail({ to, subject, react, replyTo }: SendEmailInput): Promise<{
  ok: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}> {
  if (!env.hasResend()) {
    // eslint-disable-next-line no-console
    console.info('[email skipped — RESEND_API_KEY not set]', { to, subject });
    return { ok: true, skipped: true };
  }
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: env.resendFromEmail(),
      to,
      subject,
      react,
      replyTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown email error' };
  }
}
