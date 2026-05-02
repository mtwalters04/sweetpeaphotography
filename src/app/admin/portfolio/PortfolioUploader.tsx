'use client';

import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';
import { recordPortfolioUpload, removePortfolioItem, setCoverImage } from './actions';

export type PortfolioItem = {
  id: string;
  r2_key: string;
  file_name: string | null;
  size_bytes: number | null;
  alt: string | null;
};

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
  const [progress, setProgress] = useState<{ name: string; pct: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File) {
    setProgress({ name: file.name, pct: 0 });
    const presignRes = await fetch('/api/uploads/presign', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        kind: 'portfolio',
        collection_id: collectionId,
      }),
    });
    const { url, key, error: presignErr } = await presignRes.json();
    if (!presignRes.ok || !url) throw new Error(presignErr ?? 'Presign failed');

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress({ name: file.name, pct: Math.round((e.loaded / e.total) * 100) });
        }
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status))));
      xhr.onerror = () => reject(new Error('network'));
      xhr.open('PUT', url);
      xhr.setRequestHeader('content-type', file.type);
      xhr.send(file);
    });

    const created = await recordPortfolioUpload(collectionId, {
      r2_key: key,
      file_name: file.name,
      size_bytes: file.size,
      content_type: file.type,
    });
    setItems((prev) => [
      ...prev,
      {
        id: created.id,
        r2_key: key,
        file_name: file.name,
        size_bytes: file.size,
        alt: null,
      },
    ]);
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    for (const file of Array.from(files)) {
      try {
        await uploadOne(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    }
    setProgress(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <section className="border-t border-mist pt-10 space-y-8">
      <div>
        <p className="text-ash text-t-12 eyebrow-label mb-3">Collection images</p>
        {uploadsEnabled ? (
          <div className="space-y-4">
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => onFiles(e.target.files)}
              disabled={!!progress}
              className="text-t-14 font-light"
            />
            {progress && <p className="text-t-12 text-ash">{progress.name} — {progress.pct}%</p>}
            {error && <p role="alert" className="text-t-14 text-red-700">{error}</p>}
          </div>
        ) : (
          <p className="text-t-12 text-ash italic font-light">Uploads are disabled — connect R2 to enable.</p>
        )}
      </div>

      {coverUrl && (
        <div>
          <p className="text-ash text-t-12 eyebrow-label mb-3">Current cover</p>
          <div className="relative aspect-[3/2] max-w-sm bg-mist">
            <Image src={coverUrl} alt="Current cover" fill className="object-cover" />
          </div>
        </div>
      )}

      <div>
        <p className="text-ash text-t-12 eyebrow-label mb-4">Files ({items.length})</p>
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
          <p className="text-ash text-t-14 font-light">No images uploaded yet.</p>
        )}
      </div>
    </section>
  );
}
