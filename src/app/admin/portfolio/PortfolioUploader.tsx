'use client';

import { useRef, useState, useTransition } from 'react';
import { removePortfolioItem, setCoverImage } from './actions';
import { uploadPortfolioImage, type PortfolioUploadPhase } from './uploadPortfolioImages';

export type PortfolioItem = {
  id: string;
  r2_key: string;
  file_name: string | null;
  size_bytes: number | null;
  alt: string | null;
};

function progressLabel(p: PortfolioUploadPhase | null): string | null {
  if (!p) return null;
  const nth = `${p.index + 1} / ${p.total}`;
  if (p.phase === 'presign') return `${nth} · ${p.name} — preparing…`;
  return `${nth} · ${p.name} — ${p.pct}%`;
}

export function PortfolioUploader({
  collectionId,
  uploadsEnabled,
  initialItems,
  initialCoverUrl,
  publicBaseUrl,
}: {
  collectionId: string;
  uploadsEnabled: boolean;
  initialItems: PortfolioItem[];
  initialCoverUrl: string | null;
  publicBaseUrl: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<PortfolioUploadPhase | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    const arr = Array.from(files);
    try {
      for (let i = 0; i < arr.length; i++) {
        const file = arr[i]!;
        const row = await uploadPortfolioImage(collectionId, file, {
          batchIndex: i,
          batchTotal: arr.length,
          onProgress: setPhase,
        });
        setItems((prev) => [
          ...prev,
          {
            id: row.id,
            r2_key: row.r2_key,
            file_name: file.name,
            size_bytes: file.size,
            alt: null,
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
    setPhase(null);
    setBusy(false);
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <section className="border border-mist/80 p-6 md:p-8 space-y-8 bg-bone">
      <div>
        <p className="text-ink font-serif text-t-22 mb-1">Photos for this portfolio</p>
        <p className="text-ash text-t-14 font-light leading-relaxed max-w-prose mb-6">
          This is one portfolio entry — add one image or choose many files at once from the picker (Ctrl or Shift
          to multi-select).
        </p>
        {uploadsEnabled ? (
          <div className="space-y-4">
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={(e) => onFiles(e.target.files)}
              disabled={busy || !!phase}
              className="text-t-14 font-light"
            />
            {progressLabel(phase) && (
              <p className="text-t-12 text-ash">{progressLabel(phase)}</p>
            )}
            {error && (
              <p role="alert" className="text-t-14 text-red-700">
                {error}
              </p>
            )}
          </div>
        ) : (
          <p className="text-t-12 text-ash italic font-light">Uploads need R2 storage configured.</p>
        )}
      </div>

      {coverUrl && (
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-3">Cover (listing grid and collection hero)</p>
          <div className="relative aspect-[3/2] max-w-sm overflow-hidden bg-mist">
            {/* Native img: R2 public URLs must not depend on next/image remotePatterns at build time. */}
            <img src={coverUrl} alt="Current cover" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      )}

      <div>
        <p className="text-ash text-t-12 eyebrow-label mb-4">Uploaded images ({items.length})</p>
        {items.length > 0 ? (
          <ul className="border-y border-mist divide-y divide-mist">
            {items.map((item) => (
              <li key={item.id} className="grid grid-cols-12 gap-4 py-3 text-t-14 items-baseline">
                <span className="col-span-6 font-light truncate">{item.file_name ?? 'image'}</span>
                <span className="col-span-2 text-ash text-t-12 font-light">
                  {item.size_bytes ? `${Math.round(item.size_bytes / 1024)} KB` : ''}
                </span>
                <button
                  type="button"
                  className="col-span-2 text-t-12 text-ink hover:underline text-right"
                  onClick={() =>
                    start(async () => {
                      await setCoverImage(collectionId, item.r2_key);
                      if (publicBaseUrl) {
                        setCoverUrl(`${publicBaseUrl.replace(/\/$/, '')}/${item.r2_key}`);
                      }
                    })
                  }
                  disabled={pending}
                >
                  Set cover
                </button>
                <button
                  type="button"
                  className="col-span-2 text-t-12 text-red-700 hover:underline text-right"
                  onClick={() => {
                    if (confirm('Remove this image?')) {
                      start(async () => {
                        await removePortfolioItem(item.id, collectionId);
                        setItems((prev) => prev.filter((p) => p.id !== item.id));
                      });
                    }
                  }}
                  disabled={pending}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ash text-t-14 font-light">No images yet.</p>
        )}
      </div>
    </section>
  );
}
