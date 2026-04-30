// Placeholder image source. Swap for real photos in Phase 5+ or sooner.
// Stable seeds keep the same image rendering across reloads.
export function placeholderSrc(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
