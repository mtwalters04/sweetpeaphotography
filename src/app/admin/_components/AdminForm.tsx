// Reusable admin form primitives. No client-side hooks here so server pages
// can compose freely; the actual form-state hookup lives in client wrappers.

export function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  defaultChecked,
  required,
  hint,
  step,
  min,
  textarea,
  rows = 3,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  defaultChecked?: boolean;
  required?: boolean;
  hint?: string;
  step?: string;
  min?: string | number;
  textarea?: boolean;
  rows?: number;
}) {
  const baseInput =
    'w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-16 outline-none disabled:text-ash font-light';
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-ash text-t-12 eyebrow-label mb-3"
      >
        {label}
      </label>
      {type === 'checkbox' ? (
        <input
          id={name}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="h-5 w-5 align-middle accent-ink"
        />
      ) : textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={rows}
          className={`${baseInput} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          step={step}
          min={min}
          className={baseInput}
        />
      )}
      {hint && <p className="text-t-12 text-ash mt-2 font-light italic">{hint}</p>}
    </div>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: readonly { value: string; label: string }[];
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 eyebrow-label mb-3">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-16 outline-none font-light"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-t-12 text-ash mt-2 font-light italic">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-t-14 text-red-700">
      {message}
    </p>
  );
}

export function FormSaved({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <p className="text-t-14 text-ink">Saved.</p>;
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-300 disabled:opacity-50"
    >
      {pending ? 'Saving…' : children}
    </button>
  );
}
