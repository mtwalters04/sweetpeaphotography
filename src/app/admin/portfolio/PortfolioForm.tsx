'use client';

import { useActionState, useTransition } from 'react';
import { Field, FormError, FormSaved, SubmitButton } from '../_components/AdminForm';
import { type State, deleteCollection } from './actions';
import { PortfolioUploader, type PortfolioItem } from './PortfolioUploader';

const initial: State = { error: null, saved: false };

export type PortfolioInitial = {
  id: string | null;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  cover_image_alt: string;
  order_index: number;
  published: boolean;
};

export function PortfolioForm({
  collection,
  items,
  coverUrl,
  publicBaseUrl,
  uploadsEnabled,
  action,
  submitLabel,
}: {
  collection: PortfolioInitial;
  items: PortfolioItem[];
  coverUrl: string | null;
  publicBaseUrl: string | null;
  uploadsEnabled: boolean;
  action: (prev: State, fd: FormData) => Promise<State>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [delPending, startDel] = useTransition();

  return (
    <form action={formAction} className="grid grid-cols-12 gap-10">
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <Field label="Title" name="title" defaultValue={collection.title} required />
        <Field label="Slug" name="slug" defaultValue={collection.slug} required />
        <Field label="Eyebrow" name="eyebrow" defaultValue={collection.eyebrow} />
        <Field label="Summary" name="summary" defaultValue={collection.summary} textarea rows={4} />
        <Field
          label="Cover image alt text"
          name="cover_image_alt"
          defaultValue={collection.cover_image_alt}
          hint="Describe the selected cover image for accessibility."
        />
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-8">
        <Field label="Order index" name="order_index" type="number" defaultValue={collection.order_index} />
        <Field label="Published" name="published" type="checkbox" defaultChecked={collection.published} />

        <FormError message={state.error} />
        <FormSaved visible={state.saved} />

        <div className="flex items-center gap-10 pt-4">
          <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
          {collection.id && (
            <button
              type="button"
              disabled={delPending}
              onClick={() => {
                if (confirm('Delete this collection and all images?')) {
                  startDel(async () => {
                    await deleteCollection(collection.id!);
                  });
                }
              }}
              className="text-t-12 eyebrow-label text-red-700 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </aside>

      {collection.id && (
        <div className="col-span-12">
          <PortfolioUploader
            collectionId={collection.id}
            uploadsEnabled={uploadsEnabled}
            initialItems={items}
            initialCoverUrl={coverUrl}
            publicBaseUrl={publicBaseUrl}
          />
        </div>
      )}
    </form>
  );
}
