import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { GalleryUploader, type GalleryItem } from './GalleryUploader';

export const metadata = { title: 'Gallery · Admin' };

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, starts_at, profiles!customer_id(full_name)')
    .eq('id', id)
    .single();
  if (!booking) notFound();

  const { data: items } = await supabase
    .from('gallery_items')
    .select('id, file_name, size_bytes, content_type, kind')
    .eq('booking_id', id)
    .order('order_index');

  return (
    <>
      <Link
        href={`/admin/bookings/${id}`}
        className="text-ash text-t-12 eyebrow-label hover:text-accent"
      >
        ← Booking
      </Link>
      <header className="mt-10 mb-12">
        <p className="text-ash text-t-12 eyebrow-label mb-3">Gallery</p>
        <h2 className="font-serif text-t-36 leading-tight">
          {booking.profiles?.full_name ?? 'Customer'}
        </h2>
      </header>
      <GalleryUploader
        bookingId={id}
        initialItems={(items ?? []) as GalleryItem[]}
        uploadsEnabled={env.hasR2()}
        emailEnabled={env.hasResend()}
      />
    </>
  );
}
