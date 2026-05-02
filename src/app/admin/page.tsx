import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin' };

export default async function AdminHome() {
  const supabase = await createClient();

  const { count: draftCount } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft');

  const { count: publishedCount } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');
  const { count: portfolioCount } = await (supabase as any)
    .from('portfolio_collections')
    .select('*', { count: 'exact', head: true })
    .eq('published', true);

  return (
    <>
      <p className="text-t-22 text-ash max-w-prose">
        Run daily operations from Workflow: publish open dates, triage requests, and advance each
        booking through delivery.
      </p>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <Card
          eyebrow="Calendar slots"
          headline="Publish open dates"
          subline="Create one session type per day, then open multiple time blocks."
          href="/admin/slots"
          cta="Open calendar slots →"
        />
        <Card
          eyebrow="Custom requests"
          headline="Review incoming requests"
          subline="Quote, accept, or decline custom date requests from customers."
          href="/admin/requests"
          cta="Open requests →"
        />
        <Card
          eyebrow="Journal"
          headline={`${publishedCount ?? 0} published`}
          subline={`${draftCount ?? 0} drafts in progress`}
          href="/admin/journal"
          cta="Open the Journal →"
        />
        <Card
          eyebrow="Portfolio"
          headline={`${portfolioCount ?? 0} published`}
          subline="Manage cover images and collection galleries."
          href="/admin/portfolio"
          cta="Open portfolio admin →"
        />
      </div>
    </>
  );
}

function Card({
  eyebrow,
  headline,
  subline,
  href,
  cta,
}: {
  eyebrow: string;
  headline: string;
  subline: string;
  href?: string;
  cta?: string;
}) {
  return (
    <section>
      <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-4">{eyebrow}</p>
      <div className="border-t border-mist pt-6 min-h-[180px]">
        <p className="font-serif text-t-28 leading-tight">{headline}</p>
        <p className="text-t-14 text-ash mt-3">{subline}</p>
        {href && cta && (
          <Link
            href={href}
            className="inline-block mt-6 text-t-14 underline underline-offset-4 hover:text-accent"
          >
            {cta}
          </Link>
        )}
      </div>
    </section>
  );
}
