'use client';

import Link from 'next/link';
import { useActionState, useRef, useState } from 'react';
import { submitCustomRequest, type RequestState } from './actions';

const initial: RequestState = { error: null, ok: false, needsAccount: false };

export function ContactForm({
  signedIn,
  uploadsEnabled,
  initialContact,
}: {
  signedIn: boolean;
  uploadsEnabled: boolean;
  initialContact: {
    fullName: string;
    email: string;
    phone: string;
  };
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
    <form action={action} className="space-y-8">
      {!signedIn && (
        <div className="border border-mist bg-vellum/40 px-5 py-4 text-t-14 text-ash font-light leading-relaxed">
          You can write your question first. We will ask you to sign in before final submit so your
          inquiry stays tied to your account history.
        </div>
      )}

      <input
        type="hidden"
        name="reference_image_keys"
        value={JSON.stringify(uploadedKeys.map((u) => u.key))}
      />

      <section className="border border-mist bg-vellum/35 p-6 md:p-8 space-y-5">
        <p className="eyebrow-label text-t-12 text-ash">Contact details</p>
        <Field
          label="Full name"
          name="contact_name"
          defaultValue={initialContact.fullName}
          required
          autoComplete="name"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Email"
            name="contact_email"
            type="email"
            defaultValue={initialContact.email}
            autoComplete="email"
          />
          <Field
            label="Phone number"
            name="contact_phone"
            type="tel"
            defaultValue={initialContact.phone}
            autoComplete="tel"
          />
        </div>
        <p className="text-t-12 text-ash font-light">
          Please provide at least one: email or phone. Both is preferred.
        </p>
      </section>

      <section className="border border-mist bg-bone/60 p-6 md:p-8 space-y-5">
        <p className="eyebrow-label text-t-12 text-ash">Your question</p>
        <div>
          <label
            htmlFor="message"
            className="block text-ash text-t-14 tracking-[0.01em] mb-2"
          >
            What can we help you with?
          </label>
          <p className="text-t-14 text-ash font-light mb-4">
            Ask anything. Share as much detail as you can so we can respond clearly.
          </p>
          <textarea
            id="message"
            name="message"
            rows={7}
            required
            className="w-full bg-transparent border border-ink/25 focus:border-ink px-4 py-3 text-t-16 outline-none resize-y font-light leading-relaxed"
          />
        </div>
      </section>

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
              className="text-t-14 font-light w-full border border-mist bg-vellum/20 px-4 py-3"
            />
            {uploadingError && (
              <p role="alert" className="text-t-14 text-red-700 mt-2">{uploadingError}</p>
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

      {state.error && <p role="alert" className="text-t-14 text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-500 disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send message →'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required = false,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-14 tracking-[0.01em] mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-transparent border border-ink/25 focus:border-ink px-4 py-3 text-t-16 outline-none font-light"
      />
    </div>
  );
}
