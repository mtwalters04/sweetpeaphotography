import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'on-image';

const styles: Record<Variant, string> = {
  primary:
    'inline-flex min-h-[44px] items-center gap-3 text-t-14 uppercase tracking-[0.18em] text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors duration-500 max-md:py-1 font-semibold',
  secondary:
    'inline-flex min-h-[44px] items-center gap-3 text-t-14 uppercase tracking-[0.18em] text-ash hover:text-ink transition-colors duration-500 max-md:py-1 font-medium',
  'on-image':
    'inline-flex min-h-[44px] items-center gap-3 text-t-14 uppercase tracking-[0.18em] text-bone border-b border-bone/80 pb-1 hover:text-bone hover:border-bone transition-colors duration-500 max-md:py-1 font-semibold [text-shadow:0_1px_8px_rgba(24,22,20,0.3)]',
};

export function CtaLink({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <Link href={href} className={styles[variant]}>
      <span>{children}</span>
      <span aria-hidden className="text-[1.1em] leading-none">
        →
      </span>
    </Link>
  );
}
