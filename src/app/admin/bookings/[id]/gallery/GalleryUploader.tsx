'use client';

import { useRef, useState, useTransition } from 'react';
import { recordUpload, removeGalleryItem, notifyDelivery } from './actions';

type Kind = 'original' | 'web' | 'delivery_zip';

export type GalleryItem = {
  id: string;
  file_name: string | null;
  size_bytes: number | null;
  content_type: string | null;
  kind: Kind;
};

export function GalleryUploader({
  bookingId,
  initialItems,
  uploadsEnabled,
  emailEnabled,
}: {
  bookingId: string;
  initialItems: GalleryItem[];
  uploadsEnabled: boolean;
  emailEnabled: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [kind, setKind] = useState<Kind>('web');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ name: string; pct: number } | null>(null);
  const [notifyOk, setNotifyOk] = useState<string | null>(null);
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
        kind: 'gallery',
        booking_id: bookingId,
      }),
    });
    const { url, key, error: presignErr } = await presignRes.json();
    if (!presignRes.ok || !url) throw new Error(presignErr ?? 'Presign failed');

    // Upload via XHR for progress.
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

    await recordUpload(bookingId, {
      r2_key: key,
      file_name: file.name,
      size_bytes: file.size,
      content_type: file.type,
      kind,
    });

    setItems((prev) => [
      ...prev,
      {
        id: key,
        file_name: file.name,
        size_bytes: file.size,
        content_type: file.type,
        kind,
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
    <div className="space-y-10">
      <section>
        <p className="text-ash text-t-12 eyebrow-label mb-4">Upload</p>
        {uploadsEnabled ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-t-12 eyebrow-label">
              {(['web', 'original', 'delivery_zip'] as const).map((k) => (
                <label
                  key={k}
                  className={`border px-3 py-2 cursor-pointer ${
                    kind === k ? 'border-ink text-ink' : 'border-mist text-ash hover:border-ink'
                  }`}
                >
                  <input
                    type="radio"
                    name="kind"
                    value={k}
                    checked={kind === k}
                    onChange={() => setKind(k)}
                    className="sr-only"
                  />
                  {k.replace('_', ' ')}
                </label>
              ))}
            </div>
            <input
              ref={fileInput}
              type="file"
              multiple
              onChange={(e) => onFiles(e.target.files)}
              disabled={!!progress}
              className="text-t-14 font-light"
            />
            {progress && (
              <p className="text-t-12 text-ash">
                {progress.name} — {progress.pct}%
              </p>
            )}
            {error && <p className="text-t-14 text-red-700">{error}</p>}
          </div>
        ) : (
          <p className="text-t-12 text-ash italic font-light">
            Uploads are disabled — connect R2 to enable.
          </p>
        )}
      </section>

      <section>
        <p className="text-ash text-t-12 eyebrow-label mb-4">Files ({items.length})</p>
        {items.length > 0 ? (
          <ul className="border-y border-mist divide-y divide-mist">
            {items.map((it) => (
              <li key={it.id} className="grid grid-cols-12 gap-4 py-3 text-t-14 items-baseline">
                <span className="col-span-6 font-light truncate">{it.file_name ?? '—'}</span>
                <span className="col-span-3 text-ash text-t-12 eyebrow-label">{it.kind}</span>
                <span className="col-span-2 text-ash text-t-12 font-light">
                  {it.size_bytes ? `${Math.round(it.size_bytes / 1024)} KB` : ''}
                </span>
                <button
                  type="button"
                  className="col-span-1 text-t-12 text-red-700 hover:underline text-right"
                  onClick={() => {
                    if (confirm('Remove this file?')) {
                      start(async () => {
                        await removeGalleryItem(it.id, bookingId);
                        setItems((prev) => prev.filter((i) => i.id !== it.id));
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
          <p className="text-ash text-t-14 font-light">No files uploaded.</p>
        )}
      </section>

      <section className="border-t border-mist pt-8">
        <p className="text-ash text-t-12 eyebrow-label mb-4">Deliver to customer</p>
        <p className="text-t-14 text-ash font-light mb-4 max-w-prose">
          Sends the gallery-ready email and moves the booking to <em>delivered</em>.
        </p>
        <button
          type="button"
          disabled={pending || !emailEnabled || items.length === 0}
          onClick={() =>
            start(async () => {
              const r = await notifyDelivery(bookingId);
              setNotifyOk(r.ok ? 'Sent.' : (r.error ?? 'Failed.'));
            })
          }
          className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent disabled:opacity-50"
        >
          Send delivery email →
        </button>
        {notifyOk && <p className="text-t-12 text-ash mt-3">{notifyOk}</p>}
        {!emailEnabled && (
          <p className="text-t-12 text-ash italic font-light mt-3">
            Email send will activate when Resend is connected.
          </p>
        )}
      </section>
    </div>
  );
}
