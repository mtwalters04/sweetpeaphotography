import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Journal · Admin' };

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default async function JournalAdminIndex() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, status, published_at, updated_at, tags')
    .order('updated_at', { ascending: false });

  if (error) return <p className="text-red-700">{error.message}</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-2">Journal</p>
          <h2 className="font-serif text-t-28 leading-tight">All posts</h2>
        </div>
        <Link
          href="/admin/journal/new"
          className="text-t-14 text-bone bg-ink px-5 py-2.5 hover:bg-accent transition-colors"
        >
          New post
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <table className="w-full text-t-14 border-y border-mist">
          <thead className="text-ash text-t-12 uppercase tracking-[0.2em]">
            <tr className="text-left">
              <th className="py-4 pr-4 font-normal">Title</th>
              <th className="py-4 pr-4 font-normal w-32">Status</th>
              <th className="py-4 pr-4 font-normal w-44">Published</th>
              <th className="py-4 pr-4 font-normal w-44">Last edit</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-mist">
                <td className="py-4 pr-4">
                  <Link
                    href={`/admin/journal/${post.id}/edit`}
                    className="hover:text-accent transition-colors"
                  >
                    {post.title || <span className="text-ash">Untitled</span>}
                    <span className="text-ash ml-2 text-t-12">/{post.slug}</span>
                  </Link>
                </td>
                <td className="py-4 pr-4">
                  <StatusPill status={post.status} />
                </td>
                <td className="py-4 pr-4 text-ash">{fmt(post.published_at)}</td>
                <td className="py-4 pr-4 text-ash">{fmt(post.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="border-y border-mist py-16 text-center">
          <p className="text-t-22 text-ash">No posts yet.</p>
          <Link
            href="/admin/journal/new"
            className="inline-block mt-6 text-t-14 underline underline-offset-4 hover:text-accent"
          >
            Write the first one →
          </Link>
        </div>
      )}
    </>
  );
}

function StatusPill({ status }: { status: 'draft' | 'published' | 'archived' }) {
  const tone =
    status === 'published'
      ? 'text-ink border-ink'
      : status === 'archived'
        ? 'text-ash border-ash'
        : 'text-accent border-accent';
  return (
    <span
      className={`inline-block px-2 py-1 border text-t-12 uppercase tracking-[0.15em] ${tone}`}
    >
      {status}
    </span>
  );
}
