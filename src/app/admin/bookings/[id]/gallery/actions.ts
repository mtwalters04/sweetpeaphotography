'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { sendEmail } from '@/lib/resend';
import { GalleryDeliveredEmail } from '@/lib/emails/templates';
import { env } from '@/lib/env';
import { deleteObject } from '@/lib/r2';
import type { Database } from '@/lib/supabase/database.types';

type Kind = Database['public']['Enums']['gallery_kind'];

export async function recordUpload(
  bookingId: string,
  item: {
    r2_key: string;
    file_name: string;
    size_bytes: number;
    content_type: string;
    kind: Kind;
  },
): Promise<void> {
  const { supabase } = await requireStaff();
  await supabase.from('gallery_items').insert({
    booking_id: bookingId,
    r2_key: item.r2_key,
    file_name: item.file_name,
    size_bytes: item.size_bytes,
    content_type: item.content_type,
    kind: item.kind,
  });
  revalidatePath(`/admin/bookings/${bookingId}/gallery`);
  revalidatePath(`/admin/bookings/${bookingId}`);
}

export async function removeGalleryItem(itemId: string, bookingId: string): Promise<void> {
  const { supabase } = await requireStaff();
  const { data: item } = await supabase
    .from('gallery_items')
    .select('r2_key')
    .eq('id', itemId)
    .single();
  if (item?.r2_key && env.hasR2()) {
    try {
      await deleteObject(item.r2_key);
    } catch {
      // best-effort
    }
  }
  await supabase.from('gallery_items').delete().eq('id', itemId);
  revalidatePath(`/admin/bookings/${bookingId}/gallery`);
}

export async function notifyDelivery(bookingId: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await requireStaff();
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, profiles!customer_id (full_name, email)
    `)
    .eq('id', bookingId)
    .single();
  if (!booking) return { ok: false, error: 'Booking not found' };
  if (!booking.profiles?.email) return { ok: false, error: 'Customer email missing' };

  const url = `${env.siteUrl()}/account/bookings/${bookingId}/gallery`;
  const r = await sendEmail({
    to: booking.profiles.email,
    subject: 'Your photographs are ready.',
    react: GalleryDeliveredEmail({
      customerName: booking.profiles.full_name ?? 'there',
      galleryUrl: url,
    }),
  });
  await supabase.from('email_log').insert({
    booking_id: bookingId,
    to_email: booking.profiles.email,
    subject: 'Your photographs are ready.',
    template: 'gallery_delivered',
    resend_id: r.id ?? null,
    error: r.error ?? null,
  });
  // Bump pipeline to delivered.
  await supabase.from('bookings').update({ pipeline_stage: 'delivered' }).eq('id', bookingId);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath(`/admin/bookings/${bookingId}/gallery`);
  return { ok: true };
}
