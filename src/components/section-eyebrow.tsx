// Magazine-style numbered eyebrow used to label major sections.
export function SectionEyebrow({ number, label }: { number: string; label: string }) {
  return (
    <p className="text-ash text-t-12 flex items-baseline gap-4">
      <span className="font-serif italic text-ink/80 text-t-16 not-italic-fallback">{number}</span>
      <span className="h-px w-8 bg-ash/60" aria-hidden />
      <span className="eyebrow-label">{label}</span>
    </p>
  );
}
