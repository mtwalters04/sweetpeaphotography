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

export function PortfolioUrlAndListingDetails({ collection }: { collection: PortfolioInitial }) {
  const hasExtras = !!(collection.slug || collection.eyebrow || collection.summary);
  return (
    <details className="border-t border-mist pt-6 group" {...({ defaultOpen: hasExtras })}>
      <summary className="text-ash text-t-12 uppercase tracking-[0.2em] cursor-pointer list-none flex items-center gap-3 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="text-t-14 text-ink transition-transform group-open:rotate-90 inline-block">
          →
        </span>
        URL, listing teaser, and SEO
      </summary>
      <div className="space-y-5 mt-6 text-t-14 text-ash font-light leading-relaxed border-l border-mist pl-6">
        <p>
          <strong className="text-ink font-normal">Slug</strong> is the last part of the public link (
          <code className="text-t-12 bg-mist px-1.5 py-0.5">/portfolio/your-slug</code>). Leave blank to generate
          it from the title. Change it only when you truly need a shorter or cleaner URL — existing links break if you
          change it later without a redirect.
        </p>
        <p>
          <strong className="text-ink font-normal">Eyebrow</strong> is the small uppercase label above the title on
          the main portfolio index and on the collection page — for example{' '}
          <span className="italic">&quot;Weddings&quot;</span> or{' '}
          <span className="italic">&quot;Austin, 2024&quot;</span>. Purely editorial, not metadata for Google.
        </p>
        <p>
          <strong className="text-ink font-normal">Summary</strong> appears under the title on the portfolio index and
          feeds the meta description for search results and previews when people share the collection link.
        </p>
      </div>
      <div className="space-y-6 mt-8">
        <Field
          label="Slug (optional — generated from title if empty)"
          name="slug"
          defaultValue={collection.slug}
          hint="Lowercase letters, numbers, hyphens."
        />
        <Field label="Eyebrow" name="eyebrow" defaultValue={collection.eyebrow} />
        <Field label="Summary" name="summary" defaultValue={collection.summary} textarea rows={4} />
      </div>
    </details>
  );
}

export function PortfolioForm({
  collection,
  items,
  coverUrl,
  publicBaseUrl,
  uploadsEnabled,
  action,
  submitLabel,
  uploadNotice,
}: {
  collection: PortfolioInitial;
  items: PortfolioItem[];
  coverUrl: string | null;
  publicBaseUrl: string | null;
  uploadsEnabled: boolean;
  action: (prev: State, fd: FormData) => Promise<State>;
  submitLabel: string;
  uploadNotice?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [delPending, startDel] = useTransition();

  return (
    <form action={formAction} className="grid grid-cols-12 gap-10">
      {uploadNotice && (
        <div className="col-span-12 border border-mist bg-bone p-4 text-t-14 text-ink font-light" role="status">
          {uploadNotice}
        </div>
      )}

      <div className="col-span-12 lg:col-span-8 space-y-8">
        <Field label="Title" name="title" defaultValue={collection.title} required />

        {collection.id && (
          <PortfolioUploader
            collectionId={collection.id}
            uploadsEnabled={uploadsEnabled}
            initialItems={items}
            initialCoverUrl={coverUrl}
            publicBaseUrl={publicBaseUrl}
          />
        )}

        <Field
          label="Cover image alt text"
          name="cover_image_alt"
          defaultValue={collection.cover_image_alt}
          hint="Describe the cover image for accessibility. The cover is whichever image you mark with &quot;Set cover&quot; below."
        />

        <PortfolioUrlAndListingDetails collection={collection} />
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
    </form>
  );
}
