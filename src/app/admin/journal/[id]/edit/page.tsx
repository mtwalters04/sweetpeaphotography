import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PostEditor } from '../../PostEditor';
import { updatePost, type PostFormState } from '../../actions';

export const metadata: Metadata = { title: 'Edit post · Admin' };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !post) notFound();

  const boundUpdate = updatePost.bind(null, post.id) as unknown as (
    prev: PostFormState,
    fd: FormData,
  ) => Promise<PostFormState>;

  return (
    <PostEditor
      action={boundUpdate}
      submitLabel="Save changes"
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        dek: post.dek ?? '',
        body_md: post.body_md,
        hero_image_url: post.hero_image_url ?? '',
        hero_image_alt: post.hero_image_alt ?? '',
        tags: post.tags.join(', '),
        related_service_slug: post.related_service_slug ?? '',
        meta_title: post.meta_title ?? '',
        meta_description: post.meta_description ?? '',
        canonical_url: post.canonical_url ?? '',
        status: post.status,
        slugLocked: post.status === 'published',
      }}
    />
  );
}
