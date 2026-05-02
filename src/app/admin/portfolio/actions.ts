'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import { deleteObject } from '@/lib/r2';
import { env } from '@/lib/env';
import { slugify } from '@/lib/slug';

export type State = { error: string | null; saved: boolean };

function row(fd: FormData) {
  const title = String(fd.get('title') ?? '').trim();
  return {
    title,
    slug: slugify(String(fd.get('slug') ?? '').trim() || title),
    eyebrow: String(fd.get('eyebrow') ?? '').trim() || null,
    summary: String(fd.get('summary') ?? '').trim() || null,
    cover_image_alt: String(fd.get('cover_image_alt') ?? '').trim() || null,
    order_index: Number(fd.get('order_index') ?? 0),
    published: fd.get('published') === 'on',
  };
}

/** Creates a portfolio collection without redirect — for client-led create + uploads. */
export async function createPortfolioDraft(fd: FormData): Promise<
  | { ok: true; id: string }
  | { ok: false; error: string }
> {
  try {
    const { supabase } = await requireStaff();
    const r = row(fd);
    if (!r.title) return { ok: false, error: 'Title is required.' };
    if (!r.slug) return { ok: false, error: 'Slug could not be generated from the title. Add a slug or simplify the title.' };
    const { data, error } = await (supabase as any)
      .from('portfolio_collections')
      .insert(r)
      .select('id')
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath('/admin/portfolio');
    revalidatePath('/portfolio');
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error.' };
  }
}

export async function createCollection(_prev: State, fd: FormData): Promise<State> {
  const draft = await createPortfolioDraft(fd);
  if (!draft.ok) return { error: draft.error, saved: false };
  redirect(`/admin/portfolio/${draft.id}/edit`);
}

export async function updateCollection(id: string, _prev: State, fd: FormData): Promise<State> {
  try {
    const { supabase } = await requireStaff();
    const r = row(fd);
    const { error } = await (supabase as any).from('portfolio_collections').update(r).eq('id', id);
    if (error) return { error: error.message, saved: false };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/portfolio');
  revalidatePath(`/admin/portfolio/${id}/edit`);
  revalidatePath('/portfolio');
  return { error: null, saved: true };
}

export async function deleteCollection(id: string): Promise<void> {
  const { supabase } = await requireStaff();
  const { data: items } = await (supabase as any).from('portfolio_items').select('r2_key').eq('collection_id', id);
  const { data: collection } = await (supabase as any)
    .from('portfolio_collections')
    .select('cover_image_key')
    .eq('id', id)
    .single();
  const keys = new Set<string>();
  for (const item of items ?? []) {
    if (item.r2_key) keys.add(item.r2_key);
  }
  if (collection?.cover_image_key) keys.add(collection.cover_image_key);
  if (env.hasR2()) {
    await Promise.all(
      Array.from(keys).map(async (key) => {
        try {
          await deleteObject(key);
        } catch {
          // best effort clean-up
        }
      }),
    );
  }
  await (supabase as any).from('portfolio_collections').delete().eq('id', id);
  revalidatePath('/admin/portfolio');
  revalidatePath('/portfolio');
  redirect('/admin/portfolio');
}

export async function recordPortfolioUpload(
  collectionId: string,
  item: {
    r2_key: string;
    file_name: string;
    size_bytes: number;
    content_type: string;
  },
): Promise<{ id: string }> {
  const { supabase } = await requireStaff();
  const { data, error } = await (supabase as any)
    .from('portfolio_items')
    .insert({
      collection_id: collectionId,
      r2_key: item.r2_key,
      file_name: item.file_name,
      size_bytes: item.size_bytes,
      content_type: item.content_type,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/portfolio/${collectionId}/edit`);
  revalidatePath('/portfolio');
  return { id: data.id };
}

export async function removePortfolioItem(itemId: string, collectionId: string): Promise<void> {
  const { supabase } = await requireStaff();
  const { data: item } = await (supabase as any)
    .from('portfolio_items')
    .select('r2_key')
    .eq('id', itemId)
    .single();
  if (item?.r2_key && env.hasR2()) {
    try {
      await deleteObject(item.r2_key);
    } catch {
      // best effort
    }
  }
  await (supabase as any).from('portfolio_items').delete().eq('id', itemId);
  revalidatePath(`/admin/portfolio/${collectionId}/edit`);
  revalidatePath('/portfolio');
}

export async function setCoverImage(collectionId: string, key: string): Promise<void> {
  const { supabase } = await requireStaff();
  const { data: old } = await (supabase as any)
    .from('portfolio_collections')
    .select('cover_image_key')
    .eq('id', collectionId)
    .single();
  await (supabase as any).from('portfolio_collections').update({ cover_image_key: key }).eq('id', collectionId);
  if (old?.cover_image_key && old.cover_image_key !== key && env.hasR2()) {
    try {
      await deleteObject(old.cover_image_key);
    } catch {
      // best effort
    }
  }
  revalidatePath(`/admin/portfolio/${collectionId}/edit`);
  revalidatePath('/portfolio');
}
