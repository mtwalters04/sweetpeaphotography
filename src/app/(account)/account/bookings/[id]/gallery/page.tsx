import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { presignDownload } from '@/lib/r2';
import { env } from '@/lib/env';

export const metadata: Metadata = { title: 'Gallery' };
export const dynamic = 'force-dynamic';

export default async function CustomerGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership via RLS — read booking, then items.
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, starts_at')
    .eq('id', id)
    .single();
  if (!booking) notFound();

  const { data: items } = await supabase
    .from('gallery_items')
    .select('id, file_name, kind, size_bytes, r2_key')
    .eq('booking_id', id)
    .order('order_index');

  const signed = env.hasR2()
    ? await Promise.all(
        (items ?? []).map(async (it) => ({
          ...it,
          url: await presignDownload(it.r2_key, 60 * 60 * 24),
        })),
      )
    : (items ?? []).map((it) => ({ ...it, url: null as string | null }));

  return (
    <div className="max-w-prose mx-auto">
      <Link
        href={`/account/bookings/${id}`}
        className="text-ash text-t-12 eyebrow-label hover:text-accent"
      >
        ← Booking
      </Link>

      <p className="text-ash text-t-12 eyebrow-label mt-12 mb-3">Gallery</p>
      <h1 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.015em]">
        Your photographs.
      </h1>

      {signed.length === 0 ? (
        <p className="text-t-16 text-ash font-light italic mt-12">
          Nothing here yet — we will email when the gallery is ready.
        </p>
      ) : (
        <ul className="mt-12 border-y border-mist divide-y divide-mist">
          {signed.map((it) => (
            <li
              key={it.id}
              className="grid grid-cols-12 gap-4 py-4 items-baseline text-t-14"
            >
              <span className="col-span-7 font-light truncate">{it.file_name ?? '—'}</span>
              <span className="col-span-3 text-ash text-t-12 eyebrow-label">{it.kind}</span>
              <span className="col-span-2 text-right">
                {it.url ? (
                  <a
                    href={it.url}
                    className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-t-12 text-ash italic">soon</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-t-12 text-ash font-light italic mt-12 leading-relaxed">
        Download links expire after a day. Refresh the page to generate new ones.
      </p>
    </div>
  );
}
