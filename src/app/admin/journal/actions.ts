'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { parseTags, slugify } from '@/lib/slug';

export type PostFormState = { error: string | null; saved: boolean };

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'super_admin' && profile?.role !== 'photographer') {
    throw new Error('Forbidden.');
  }
  return { supabase, userId: user.id };
}

function buildRow(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const dek = String(formData.get('dek') ?? '').trim() || null;
  const body_md = String(formData.get('body_md') ?? '');
  const hero_image_url = String(formData.get('hero_image_url') ?? '').trim() || null;
  const hero_image_alt = String(formData.get('hero_image_alt') ?? '').trim() || null;
  const tags = parseTags(String(formData.get('tags') ?? ''));
  const related_service_slug =
    String(formData.get('related_service_slug') ?? '').trim() || null;
  const meta_title = String(formData.get('meta_title') ?? '').trim() || null;
  const meta_description = String(formData.get('meta_description') ?? '').trim() || null;
  const canonical_url = String(formData.get('canonical_url') ?? '').trim() || null;
  const slug = slugify(rawSlug || title);

  return {
    title,
    slug,
    dek,
    body_md,
    hero_image_url,
    hero_image_alt,
    tags,
    related_service_slug,
    meta_title,
    meta_description,
    canonical_url,
  };
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  let id: string;
  try {
    const { supabase, userId } = await requireStaff();
    const row = buildRow(formData);
    if (!row.title) return { error: 'Title is required.', saved: false };
    if (!row.slug) return { error: 'Slug is required.', saved: false };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ ...row, author_id: userId })
      .select('id')
      .single();
    if (error) return { error: error.message, saved: false };
    id = data.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/journal');
  redirect(`/admin/journal/${id}/edit`);
}

export async function updatePost(
  postId: string,
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  try {
    const { supabase } = await requireStaff();
    const row = buildRow(formData);
    if (!row.title) return { error: 'Title is required.', saved: false };
    if (!row.slug) return { error: 'Slug is required.', saved: false };

    const { error } = await supabase.from('blog_posts').update(row).eq('id', postId);
    if (error) return { error: error.message, saved: false };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/journal');
  revalidatePath(`/admin/journal/${postId}/edit`);
  return { error: null, saved: true };
}

export async function setPostStatus(
  postId: string,
  status: 'draft' | 'published' | 'archived',
): Promise<void> {
  const { supabase } = await requireStaff();
  const { error } = await supabase.from('blog_posts').update({ status }).eq('id', postId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/journal');
  revalidatePath(`/admin/journal/${postId}/edit`);
  revalidatePath('/journal');
}

export async function deletePost(postId: string): Promise<void> {
  const { supabase } = await requireStaff();
  const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/journal');
  redirect('/admin/journal');
}

