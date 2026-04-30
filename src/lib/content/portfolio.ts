// Static portfolio collections for Phase 1. Real photos replace these later.
export type PortfolioImage = {
  seed: string;
  alt: string;
  orientation: 'portrait' | 'landscape' | 'square';
};

export type PortfolioCollection = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  cover: PortfolioImage;
  images: readonly PortfolioImage[];
};

const collection = (
  slug: string,
  title: string,
  eyebrow: string,
  summary: string,
  cover: PortfolioImage,
  images: readonly PortfolioImage[],
): PortfolioCollection => ({ slug, title, eyebrow, summary, cover, images });

export const PORTFOLIO: readonly PortfolioCollection[] = [
  collection(
    'rowan-and-iris',
    'Rowan & Iris',
    'Wedding · Late summer',
    'A small ceremony at her grandmother’s home. The light through the kitchen window did most of the work.',
    { seed: 'rowan-iris-cover', alt: 'Bride and groom in a doorway', orientation: 'portrait' },
    [
      { seed: 'rowan-iris-01', alt: 'Bride alone before the ceremony', orientation: 'portrait' },
      { seed: 'rowan-iris-02', alt: 'Reception table at dusk', orientation: 'landscape' },
      { seed: 'rowan-iris-03', alt: 'Hands clasped during vows', orientation: 'square' },
      { seed: 'rowan-iris-04', alt: 'Couple walking through a field', orientation: 'landscape' },
      { seed: 'rowan-iris-05', alt: 'Grandmother adjusting the veil', orientation: 'portrait' },
      { seed: 'rowan-iris-06', alt: 'First dance under string lights', orientation: 'landscape' },
    ],
  ),
  collection(
    'the-marrows',
    'The Marrows',
    'Family · Annual portrait',
    'A return visit. Two more children since the last set, the same garden.',
    { seed: 'marrows-cover', alt: 'Family in a garden at dusk', orientation: 'landscape' },
    [
      { seed: 'marrows-01', alt: 'Two siblings on a porch swing', orientation: 'square' },
      { seed: 'marrows-02', alt: 'Mother and youngest child', orientation: 'portrait' },
      { seed: 'marrows-03', alt: 'Family walking away from camera', orientation: 'landscape' },
      { seed: 'marrows-04', alt: 'Father lifting toddler', orientation: 'portrait' },
    ],
  ),
  collection(
    'wren-portrait',
    'Wren, at twenty-two',
    'Portrait · Studio and street',
    'A graduation portrait that turned into something else by the end of the hour.',
    { seed: 'wren-cover', alt: 'Wren in soft window light', orientation: 'portrait' },
    [
      { seed: 'wren-01', alt: 'Close portrait, eyes lowered', orientation: 'portrait' },
      { seed: 'wren-02', alt: 'Walking shot in the city', orientation: 'landscape' },
      { seed: 'wren-03', alt: 'Profile against a stone wall', orientation: 'portrait' },
      { seed: 'wren-04', alt: 'Hands holding a book', orientation: 'square' },
    ],
  ),
  collection(
    'birch-and-vale',
    'Birch & Vale',
    'Engagement · River walk',
    'An afternoon at the river. Cold feet, warm hands.',
    { seed: 'birch-cover', alt: 'Couple wading at sunset', orientation: 'landscape' },
    [
      { seed: 'birch-01', alt: 'Couple seated on a stone', orientation: 'square' },
      { seed: 'birch-02', alt: 'Walking the path back', orientation: 'landscape' },
      { seed: 'birch-03', alt: 'Quiet portrait, half-light', orientation: 'portrait' },
    ],
  ),
  collection(
    'autumn-minis',
    'Autumn mini sessions',
    'Mini · October release',
    'A long Saturday in the orchard. Twelve families, one tree, one slow afternoon.',
    { seed: 'autumn-cover', alt: 'Family under an apple tree', orientation: 'landscape' },
    [
      { seed: 'autumn-01', alt: 'Toddler with apple', orientation: 'square' },
      { seed: 'autumn-02', alt: 'Couple in matching wool', orientation: 'portrait' },
      { seed: 'autumn-03', alt: 'Siblings backlit', orientation: 'landscape' },
    ],
  ),
];

export function getCollection(slug: string): PortfolioCollection | undefined {
  return PORTFOLIO.find((c) => c.slug === slug);
}
