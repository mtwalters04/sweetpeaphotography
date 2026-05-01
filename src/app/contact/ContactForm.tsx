'use client';

import Link from 'next/link';
import { useActionState, useRef, useState } from 'react';
import { submitCustomRequest, type RequestState } from './actions';

const initial: RequestState = { error: null, ok: false, needsAccount: false };

export type ServiceOption = { value: string; label: string };

export function ContactForm({
  signedIn,
  uploadsEnabled,
  services,
}: {
  signedIn: boolean;
  uploadsEnabled: boolean;
  services: readonly ServiceOption[];
}) {
  const [state, action, pending] = useActionState(submitCustomRequest, initial);
  const [uploadedKeys, setUploadedKeys] = useState<{ name: string; key: string }[]>([]);
  const [uploadingError, setUploadingError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !uploadsEnabled) return;
    setUploadingError(null);
    for (const file of Array.from(files)) {
      try {
        const presignRes = await fetch('/api/uploads/presign', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
            kind: 'request',
          }),
        });
        const { url, key, error } = await presignRes.json();
        if (!presignRes.ok || !url) throw new Error(error ?? 'Presign failed');
        const putRes = await fetch(url, {
          method: 'PUT',
          headers: { 'content-type': file.type },
          body: file,
        });
        if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);
        setUploadedKeys((prev) => [...prev, { name: file.name, key }]);
      } catch (err) {
        setUploadingError(err instanceof Error ? err.message : 'Upload error');
      }
    }
    if (fileInput.current) fileInput.current.value = '';
  }

  if (state.ok) {
    return (
      <div className="border border-mist p-8 bg-vellum/40">
        <p className="font-serif text-t-28 leading-tight">Thank you.</p>
        <p className="text-ash text-t-16 font-light mt-3 max-w-prose">
          We have your request and a confirmation is on its way. We will reply within two business
          days.
        </p>
        {state.requestId && (
          <Link
            href={`/account/requests/${state.requestId}`}
            className="inline-block mt-6 text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent"
          >
            View my request →
          </Link>
        )}
      </div>
    );
  }

  if (state.needsAccount) {
    return (
      <div className="border border-mist p-8 bg-vellum/40">
        <p className="font-serif text-t-22 leading-tight">An account first.</p>
        <p className="text-ash text-t-14 font-light mt-3 max-w-prose">
          Custom requests are tied to an account so we can keep history, credits, and the booking
          calendar in one place.
        </p>
        <div className="flex gap-6 mt-6">
          <Link
            href="/signup?next=/contact"
            className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent"
          >
            Create an account →
          </Link>
          <Link
            href="/login?next=/contact"
            className="text-t-12 eyebrow-label text-ash hover:text-ink"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-10">
      {!signedIn && (
        <div className="border border-mist p-4 bg-vellum/30 text-t-14 text-ash font-light">
          You will be asked to sign in or create an account before submitting.
        </div>
      )}

      <input
        type="hidden"
        name="reference_image_keys"
        value={JSON.stringify(uploadedKeys.map((u) => u.key))}
      />

      <Field label="Preferred date" name="date" type="date" />
      <Field label="Preferred time" name="time" type="time" />

      <SelectField
        label="Type of session"
        name="service"
        options={[...services, { value: '', label: 'Something else' }]}
      />

      <SelectField
        label="Photographer preference"
        name="photographer_pref"
        defaultValue="either"
        options={[
          { value: 'either', label: 'Either / both' },
          { value: 'a', label: 'Photographer A' },
          { value: 'b', label: 'Photographer B' },
          { value: 'none', label: 'No preference' },
        ]}
      />

      <Field label="Location (optional)" name="location" />

      <div>
        <label
          htmlFor="message"
          className="block text-ash text-t-12 eyebrow-label mb-4"
        >
          What would you like us to know?
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-4 text-t-16 outline-none resize-none font-light"
        />
      </div>

      <div>
        <label className="block text-ash text-t-12 eyebrow-label mb-4">
          Reference images (optional)
        </label>
        {uploadsEnabled ? (
          <>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={(e) => handleFiles(e.target.files)}
              className="text-t-14 font-light"
            />
            {uploadingError && (
              <p className="text-t-14 text-red-700 mt-2">{uploadingError}</p>
            )}
            {uploadedKeys.length > 0 && (
              <ul className="mt-3 text-t-12 text-ash space-y-1">
                {uploadedKeys.map((u) => (
                  <li key={u.key}>· {u.name}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-t-12 text-ash font-light italic">
            Image uploads will be enabled once R2 is connected.
          </p>
        )}
      </div>

      {state.error && <p className="text-t-14 text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-500 disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send request →'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 eyebrow-label mb-4">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-4 text-t-16 outline-none font-light"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 eyebrow-label mb-4">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ''}
        className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-4 text-t-16 outline-none font-light"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value || o.label} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
