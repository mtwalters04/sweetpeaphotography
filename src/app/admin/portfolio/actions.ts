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

export async function createCollection(_prev: State, fd: FormData): Promise<State> {
  let id: string;
  try {
    const { supabase } = await requireStaff();
    const r = row(fd);
    if (!r.title) return { error: 'Title is required.', saved: false };
    if (!r.slug) return { error: 'Slug is required.', saved: false };
    const { data, error } = await (supabase as any)
      .from('portfolio_collections')
      .insert(r)
      .select('id')
      .single();
    if (error) return { error: error.message, saved: false };
    id = data.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/portfolio');
  revalidatePath('/portfolio');
  redirect(`/admin/portfolio/${id}/edit`);
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
