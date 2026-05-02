'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Field, FormError } from '../_components/AdminForm';
import { createPortfolioDraft, setCoverImage } from './actions';
import { uploadPortfolioImagesSequential, type PortfolioUploadPhase } from './uploadPortfolioImages';
import { PortfolioUrlAndListingDetails, type PortfolioInitial } from './PortfolioForm';

function progressLine(p: PortfolioUploadPhase | null): string | null {
  if (!p) return null;
  const nth = `${p.index + 1} / ${p.total}`;
  if (p.phase === 'presign') return `${nth} · ${p.name} — preparing…`;
  return `${nth} · ${p.name} — ${p.pct}%`;
}

const emptyCollection: PortfolioInitial = {
  id: null,
  slug: '',
  title: '',
  eyebrow: '',
  summary: '',
  cover_image_alt: '',
  order_index: 0,
  published: false,
};

export function PortfolioCreateForm({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [queued, setQueued] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<PortfolioUploadPhase | null>(null);

  return (
    <form
      className="grid grid-cols-12 gap-10"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPending(true);
        const fd = new FormData(e.currentTarget);
        const draft = await createPortfolioDraft(fd);
        if (!draft.ok) {
          setError(draft.error);
          setPending(false);
          return;
        }
        let uploadMessage: string | null = null;
        try {
          if (queued.length > 0 && uploadsEnabled) {
            const rows = await uploadPortfolioImagesSequential(draft.id, queued, setPhase);
            if (rows[0]?.r2_key) {
              await setCoverImage(draft.id, rows[0].r2_key);
            }
          } else if (queued.length > 0 && !uploadsEnabled) {
            uploadMessage = 'Collection created. Add images on the next screen once storage is configured.';
          }
        } catch (err) {
          uploadMessage =
            err instanceof Error
              ? err.message
              : 'Some images may not have uploaded. Open the collection to retry.';
        } finally {
          setPhase(null);
        }
        const q = uploadMessage ? `?upload_notice=${encodeURIComponent(uploadMessage)}` : '';
        router.push(`/admin/portfolio/${draft.id}/edit${q}`);
      }}
    >
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <Field label="Title" name="title" defaultValue="" required />

        <section className="border border-mist/80 p-6 md:p-8 space-y-4 bg-bone">
          <p className="text-ink font-serif text-t-22">Photos (optional now)</p>
          <p className="text-ash text-t-14 font-light leading-relaxed max-w-prose">
            Pick one file or several at once — they all belong to this single portfolio entry. If you skip this,
            you can add photos after you save.
          </p>
          {uploadsEnabled ? (
            <>
              <input
                ref={fileInput}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/heic"
                disabled={pending}
                onChange={(ev) => {
                  const list = ev.target.files;
                  setQueued(list ? Array.from(list) : []);
                }}
                className="text-t-14 font-light"
              />
              {queued.length > 0 && (
                <p className="text-t-12 text-ash font-light">
                  {queued.length} file{queued.length === 1 ? '' : 's'} ready — uploads run when you create.
                </p>
              )}
            </>
          ) : (
            <p className="text-t-12 text-ash italic font-light">Connect R2 to upload from this step.</p>
          )}
          {progressLine(phase) && <p className="text-t-12 text-ash">{progressLine(phase)}</p>}
        </section>

        <Field
          label="Cover image alt text"
          name="cover_image_alt"
          defaultValue=""
          hint="Short description of the cover image for screen readers. You can fine-tune after you set the cover."
        />

        <PortfolioUrlAndListingDetails collection={emptyCollection} />
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-8">
        <Field label="Order index" name="order_index" type="number" defaultValue={0} />
        <Field label="Published" name="published" type="checkbox" />
        <FormError message={error} />
        <div className="pt-4">
          <button
            type="submit"
            disabled={pending}
            className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-300 disabled:opacity-50"
          >
            {pending ? 'Creating…' : 'Create →'}
          </button>
        </div>
      </aside>
    </form>
  );
}
