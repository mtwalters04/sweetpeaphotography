import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Account' };

// Empty-state shell for Phase 2. Bookings, requests, credits land in later phases.
export default function AccountOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      <Section
        title="Credit balance"
        body={
          <p className="font-serif text-t-48 leading-none">$0</p>
        }
      />
      <Section
        title="Upcoming sessions"
        body={
          <Empty
            text="No upcoming sessions yet."
            cta={{ href: '/book', label: 'See available dates →' }}
          />
        }
      />
      <Section
        title="Custom requests"
        body={
          <Empty
            text="No requests submitted."
            cta={{ href: '/contact', label: 'Request a custom date →' }}
          />
        }
      />
    </div>
  );
}

function Section({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <section>
      <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-4">{title}</p>
      <div className="border-t border-mist pt-6 min-h-[180px]">{body}</div>
    </section>
  );
}

function Empty({ text, cta }: { text: string; cta: { href: string; label: string } }) {
  return (
    <div>
      <p className="text-t-16 text-ash">{text}</p>
      <Link
        href={cta.href}
        className="inline-block mt-4 text-t-14 underline underline-offset-4 hover:text-accent"
      >
        {cta.label}
      </Link>
    </div>
  );
}
