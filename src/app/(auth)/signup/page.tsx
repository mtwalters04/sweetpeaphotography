import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthShell } from '../AuthShell';
import { SignupForm } from './SignupForm';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create your Sweet Pea Photography account.',
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Create an account."
      footer={
        <>
          Already a client?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-accent">
            Sign in
          </Link>
          .
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
