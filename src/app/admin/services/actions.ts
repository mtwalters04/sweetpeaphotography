'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import { dollarsToCents } from '@/lib/money';
import { slugify } from '@/lib/slug';

export type State = { error: string | null; saved: boolean };

function row(fd: FormData) {
  const name = String(fd.get('name') ?? '').trim();
  const slug = slugify(String(fd.get('slug') ?? '').trim() || name);
  const includesRaw = String(fd.get('includes') ?? '');
  const includes = includesRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    name,
    slug,
    eyebrow: String(fd.get('eyebrow') ?? '').trim() || null,
    summary: String(fd.get('summary') ?? '').trim() || null,
    description: String(fd.get('description') ?? '').trim() || null,
    duration_minutes: Number(fd.get('duration_minutes') ?? 60),
    starting_at_cents: dollarsToCents(String(fd.get('starting_at_dollars') ?? '0')),
    deposit_pct: Math.max(
      0.01,
      Math.min(1, Number(fd.get('deposit_pct') ?? 0.3)),
    ),
    includes,
    order_index: Number(fd.get('order_index') ?? 0),
    active: fd.get('active') === 'on',
  };
}

export async function createService(_prev: State, fd: FormData): Promise<State> {
  let id: string;
  try {
    const { supabase } = await requireStaff();
    const r = row(fd);
    if (!r.name) return { error: 'Name is required.', saved: false };
    if (!r.slug) return { error: 'Slug is required.', saved: false };
    if (!r.starting_at_cents) return { error: 'Starting price is required.', saved: false };
    const { data, error } = await supabase
      .from('session_types')
      .insert(r)
      .select('id')
      .single();
    if (error) return { error: error.message, saved: false };
    id = data.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/services');
  redirect(`/admin/services/${id}/edit`);
}

export async function updateService(id: string, _prev: State, fd: FormData): Promise<State> {
  try {
    const { supabase } = await requireStaff();
    const r = row(fd);
    const { error } = await supabase.from('session_types').update(r).eq('id', id);
    if (error) return { error: error.message, saved: false };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/services');
  return { error: null, saved: true };
}

export async function deleteService(id: string): Promise<void> {
  const { supabase } = await requireStaff();
  await supabase.from('session_types').delete().eq('id', id);
  revalidatePath('/admin/services');
  redirect('/admin/services');
}
