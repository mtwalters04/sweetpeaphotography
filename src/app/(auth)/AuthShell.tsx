import Link from 'next/link';

export function AuthShell({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-24 px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="block text-ash text-t-12 uppercase tracking-[0.2em] mb-10 hover:text-accent"
        >
          ← Sweet Pea
        </Link>
        <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-4">{eyebrow}</p>
        <h1 className="font-serif text-t-36 leading-tight mb-10">{title}</h1>
        {children}
        {footer && <div className="mt-10 text-t-14 text-ash">{footer}</div>}
      </div>
    </section>
  );
}

export function FormField({
  label,
  name,
  type = 'text',
  autoComplete,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 uppercase tracking-[0.2em] mb-3">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-16 outline-none"
      />
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full text-t-14 text-bone bg-ink px-6 py-3 hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Working…' : children}
    </button>
  );
}
