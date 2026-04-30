import type { Metadata } from 'next';
import { PostEditor } from '../PostEditor';
import { createPost } from '../actions';

export const metadata: Metadata = { title: 'New post · Admin' };

export default function NewPostPage() {
  return (
    <PostEditor
      action={createPost}
      submitLabel="Create draft"
      post={{
        id: null,
        title: '',
        slug: '',
        dek: '',
        body_md: '',
        hero_image_url: '',
        hero_image_alt: '',
        tags: '',
        related_service_slug: '',
        meta_title: '',
        meta_description: '',
        canonical_url: '',
        status: 'draft',
        slugLocked: false,
      }}
    />
  );
}
