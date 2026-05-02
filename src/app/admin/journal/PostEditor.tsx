'use client';

import { useActionState, useState, useTransition } from 'react';
import { type PostFormState, setPostStatus, deletePost } from './actions';

const initialPostFormState: PostFormState = { error: null, saved: false };
import { Markdown } from '@/components/markdown';
import { readingTimeLabel } from '@/lib/reading-time';

export type PostInitial = {
  id: string | null;
  title: string;
  slug: string;
  dek: string;
  body_md: string;
  hero_image_url: string;
  hero_image_alt: string;
  tags: string;
  related_service_slug: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  status: 'draft' | 'published' | 'archived';
  slugLocked: boolean;
};

type Props = {
  post: PostInitial;
  action: (prev: PostFormState, fd: FormData) => Promise<PostFormState>;
  submitLabel: string;
};

export function PostEditor({ post, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, initialPostFormState);
  const [body, setBody] = useState(post.body_md);
  const [showPreview, setShowPreview] = useState(false);
  const [statusPending, startTransition] = useTransition();

  return (
    <form action={formAction} className="grid grid-cols-12 gap-10">
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <Field label="Title" name="title" defaultValue={post.title} required />
        <Field
          label="Slug"
          name="slug"
          defaultValue={post.slug}
          required
          disabled={post.slugLocked}
          hint={
            post.slugLocked
              ? 'Locked — slugs are immutable after publishing.'
              : 'Auto-generated from title if left blank.'
          }
        />
        <Field
          label="Dek (subhead / SEO description)"
          name="dek"
          defaultValue={post.dek}
          textarea
          rows={2}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="body_md"
              className="block text-ash text-t-12 uppercase tracking-[0.2em]"
            >
              Body — markdown
            </label>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="text-t-12 uppercase tracking-[0.15em] text-ash hover:text-accent"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {showPreview ? (
            <div className="border border-mist p-6 min-h-[400px]">
              {body.trim() ? (
                <Markdown source={body} />
              ) : (
                <p className="text-ash text-t-14">Nothing to preview.</p>
              )}
            </div>
          ) : (
            <textarea
              id="body_md"
              name="body_md"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={24}
              className="w-full bg-transparent border border-mist focus:border-ink p-4 text-t-16 outline-none font-mono"
            />
          )}
          <p className="text-t-12 text-ash mt-2">{readingTimeLabel(body)}</p>
        </div>

        <Field label="Hero image URL (R2 lands later)" name="hero_image_url" defaultValue={post.hero_image_url} />
        <Field label="Hero image alt text" name="hero_image_alt" defaultValue={post.hero_image_alt} />

        <details className="border-t border-mist pt-6">
          <summary className="text-ash text-t-12 uppercase tracking-[0.2em] cursor-pointer">
            SEO overrides (optional)
          </summary>
          <div className="space-y-6 mt-6">
            <Field label="Meta title" name="meta_title" defaultValue={post.meta_title} />
            <Field
              label="Meta description"
              name="meta_description"
              defaultValue={post.meta_description}
              textarea
              rows={2}
            />
            <Field label="Canonical URL" name="canonical_url" defaultValue={post.canonical_url} />
          </div>
        </details>

        {state.error && <p role="alert" className="text-t-14 text-red-700">{state.error}</p>}
        {state.saved && <p className="text-t-14 text-ink">Saved.</p>}

        <button
          type="submit"
          disabled={pending}
          className="text-t-14 text-bone bg-ink px-6 py-3 hover:bg-accent transition-colors disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-8">
        <section>
          <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-3">Status</p>
          <p className="font-serif text-t-28 capitalize">{post.status}</p>
          {post.id && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.status !== 'published' && (
                <StatusButton
                  pending={statusPending}
                  label="Publish"
                  onClick={() =>
                    startTransition(async () => {
                      await setPostStatus(post.id!, 'published');
                    })
                  }
                />
              )}
              {post.status === 'published' && (
                <StatusButton
                  pending={statusPending}
                  label="Unpublish (draft)"
                  onClick={() =>
                    startTransition(async () => {
                      await setPostStatus(post.id!, 'draft');
                    })
                  }
                />
              )}
              {post.status !== 'archived' && (
                <StatusButton
                  pending={statusPending}
                  label="Archive"
                  onClick={() =>
                    startTransition(async () => {
                      await setPostStatus(post.id!, 'archived');
                    })
                  }
                />
              )}
            </div>
          )}
        </section>

        <Field label="Tags (comma-separated)" name="tags" defaultValue={post.tags} />
        <Field
          label="Related service slug"
          name="related_service_slug"
          defaultValue={post.related_service_slug}
          hint="Internal cross-sell. e.g. wedding, portrait, family."
        />

        {post.id && (
          <section className="border-t border-mist pt-6">
            <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-3">Danger</p>
            <button
              type="button"
              disabled={statusPending}
              onClick={() => {
                if (confirm('Delete this post permanently?')) {
                  startTransition(async () => {
                    await deletePost(post.id!);
                  });
                }
              }}
              className="text-t-14 text-red-700 underline underline-offset-4"
            >
              Delete post
            </button>
          </section>
        )}
      </aside>
    </form>
  );
}

function StatusButton({
  pending,
  label,
  onClick,
}: {
  pending: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-t-12 uppercase tracking-[0.15em] border border-ink px-3 py-2 hover:bg-ink hover:text-bone transition-colors disabled:opacity-60"
    >
      {label}
    </button>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  disabled,
  hint,
  textarea,
  rows = 1,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const common =
    'w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-16 outline-none disabled:text-ash';
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 uppercase tracking-[0.2em] mb-3">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`${common} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
          className={common}
        />
      )}
      {hint && <p className="text-t-12 text-ash mt-2">{hint}</p>}
    </div>
  );
}
