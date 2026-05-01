'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';

export type State = { error: string | null; saved: boolean };

function row(fd: FormData) {
  return {
    quote: String(fd.get('quote') ?? '').trim(),
    attribution: String(fd.get('attribution') ?? '').trim(),
    context: String(fd.get('context') ?? '').trim() || null,
    featured: fd.get('featured') === 'on',
    approved: fd.get('approved') === 'on',
    order_index: Number(fd.get('order_index') ?? 0),
  };
}

export async function createTestimonial(_prev: State, fd: FormData): Promise<State> {
  let id: string;
  try {
    const { supabase } = await requireStaff();
    const r = row(fd);
    if (!r.quote || !r.attribution) {
      return { error: 'Quote and attribution required.', saved: false };
    }
    const { data, error } = await supabase.from('testimonials').insert(r).select('id').single();
    if (error) return { error: error.message, saved: false };
    id = data.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error', saved: false };
  }
  revalidatePath('/admin/testimonials');
  redirect(`/admin/testimonials/${id}/edit`);
}

export async function updateTestimonial(
  id: string,
  _prev: State,
  fd: FormData,
): Promise<State> {
  try {
    const { supabase } = await requireStaff();
    const r = row(fd);
    const { error } = await supabase.from('testimonials').update(r).eq('id', id);
    if (error) return { error: error.message, saved: false };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error', saved: false };
  }
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
  return { error: null, saved: true };
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { supabase } = await requireStaff();
  await supabase.from('testimonials').delete().eq('id', id);
  revalidatePath('/admin/testimonials');
  redirect('/admin/testimonials');
}
