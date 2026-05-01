'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';

export type State = { error: string | null; saved: boolean };

function row(fd: FormData) {
  return {
    public_name: String(fd.get('public_name') ?? '').trim(),
    public_bio: String(fd.get('public_bio') ?? '').trim() || null,
    order_index: Number(fd.get('order_index') ?? 0),
    active: fd.get('active') === 'on',
  };
}

export async function createPhotographer(_prev: State, fd: FormData): Promise<State> {
  let id: string;
  try {
    const { supabase } = await requireStaff();
    const r = row(fd);
    if (!r.public_name) return { error: 'Name is required.', saved: false };
    const { data, error } = await supabase
      .from('photographers')
      .insert(r)
      .select('id')
      .single();
    if (error) return { error: error.message, saved: false };
    id = data.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/photographers');
  redirect(`/admin/photographers/${id}/edit`);
}

export async function updatePhotographer(
  id: string,
  _prev: State,
  fd: FormData,
): Promise<State> {
  try {
    const { supabase } = await requireStaff();
    const r = row(fd);
    const { error } = await supabase.from('photographers').update(r).eq('id', id);
    if (error) return { error: error.message, saved: false };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/photographers');
  return { error: null, saved: true };
}

export async function deletePhotographer(id: string): Promise<void> {
  const { supabase } = await requireStaff();
  await supabase.from('photographers').delete().eq('id', id);
  revalidatePath('/admin/photographers');
  redirect('/admin/photographers');
}
