'use client';

import { recordPortfolioUpload } from './actions';

export type PortfolioUploadPhase =
  | { phase: 'presign'; index: number; total: number; name: string }
  | { phase: 'upload'; index: number; total: number; name: string; pct: number };

type UploadOpts = {
  onProgress?: (p: PortfolioUploadPhase) => void;
  batchIndex?: number;
  batchTotal?: number;
};

/**
 * Upload a single portfolio image to R2, then persist a portfolio_items row.
 */
export async function uploadPortfolioImage(
  collectionId: string,
  file: File,
  opts?: UploadOpts,
): Promise<{ id: string; r2_key: string }> {
  const index = opts?.batchIndex ?? 0;
  const total = opts?.batchTotal ?? 1;
  const onProgress = opts?.onProgress;

  onProgress?.({ phase: 'presign', index, total, name: file.name });
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
        onProgress?.({
          phase: 'upload',
          index,
          total,
          name: file.name,
          pct: Math.round((e.loaded / e.total) * 100),
        });
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status)));
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
  return { id: created.id, r2_key: key };
}

export async function uploadPortfolioImagesSequential(
  collectionId: string,
  files: File[],
  onProgress?: (p: PortfolioUploadPhase) => void,
): Promise<{ id: string; r2_key: string }[]> {
  const out: { id: string; r2_key: string }[] = [];
  const total = files.length;
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const row = await uploadPortfolioImage(collectionId, file, {
      batchIndex: i,
      batchTotal: total,
      onProgress,
    });
    out.push(row);
  }
  return out;
}
