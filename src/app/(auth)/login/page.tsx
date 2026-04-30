import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthShell } from '../AuthShell';
import { LoginForms } from './LoginForms';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Sweet Pea Photography account.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? '/account';

  return (
    <AuthShell
      eyebrow="Account"
      title="Welcome back."
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-accent">
            Create an account
          </Link>
          .
        </>
      }
    >
      {sp.error === 'auth_callback_failed' && (
        <p className="text-t-14 text-red-700 mb-6">
          That sign-in link has expired or was already used. Try again.
        </p>
      )}
      <LoginForms next={next} />
    </AuthShell>
  );
}
