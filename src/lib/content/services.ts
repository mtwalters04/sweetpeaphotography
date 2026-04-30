// Static service catalog for Phase 1. Phase 3 moves this to the database.
export type Service = {
  slug: string;
  name: string;
  eyebrow: string;
  startingAt: number;
  durationLabel: string;
  summary: string;
  description: string;
  includes: readonly string[];
};

export const SERVICES: readonly Service[] = [
  {
    slug: 'portrait',
    name: 'Portrait Sessions',
    eyebrow: 'Solo, couple, or family',
    startingAt: 450,
    durationLabel: '60–90 minutes',
    summary: 'Quiet, unhurried portraits in natural light.',
    description:
      'A relaxed session at a location of your choosing. We plan together, shoot through the best window of light, and deliver an edited gallery of stills you will return to for years.',
    includes: [
      'Pre-shoot planning call',
      '60–90 minutes of coverage',
      '40+ edited high-resolution images',
      'Private online gallery for one year',
      'Print release',
    ],
  },
  {
    slug: 'wedding',
    name: 'Weddings',
    eyebrow: 'Full-day coverage',
    startingAt: 4200,
    durationLabel: '8–10 hours',
    summary: 'Two photographers, the entire day, every quiet moment.',
    description:
      'Both of us on site from morning preparations through the last dance. We work in pairs so nothing is missed — the held breath before the aisle, the laugh in the kitchen, the toast nobody planned.',
    includes: [
      'Two photographers on site',
      '8–10 hours of coverage',
      'Engagement session credit ($350)',
      '600+ edited images',
      'Online gallery + downloadable archive',
      'Print release',
    ],
  },
  {
    slug: 'engagement',
    name: 'Engagements',
    eyebrow: 'Before the day itself',
    startingAt: 650,
    durationLabel: '90 minutes',
    summary: 'A short, easy session to find your rhythm in front of the camera.',
    description:
      'Often booked alongside a wedding. We use it to learn how you move together, and you use it to stop being nervous about a lens. The photographs are a quiet bonus.',
    includes: [
      'One location, two outfits',
      '90 minutes of coverage',
      '60+ edited images',
      'Save-the-date image set',
    ],
  },
  {
    slug: 'family',
    name: 'Family',
    eyebrow: 'Annual or milestone',
    startingAt: 550,
    durationLabel: '60 minutes',
    summary: 'For the years you want to remember in a single frame.',
    description:
      'Brought to your home, your garden, or a place that matters. We work fast with small children and slower with everyone else.',
    includes: [
      'On-location anywhere within the metro',
      '60 minutes of coverage',
      '40+ edited images',
      'Holiday card-ready selects',
    ],
  },
  {
    slug: 'mini-session',
    name: 'Mini Sessions',
    eyebrow: 'Seasonal, limited dates',
    startingAt: 245,
    durationLabel: '20 minutes',
    summary: 'Short sittings released a few times each year.',
    description:
      'Released around the holidays and in spring. Fixed location, fixed look, a small set of beautifully edited images at a fraction of the full session price.',
    includes: ['20 minutes of coverage', '10 edited images', 'Same-week delivery'],
  },
  {
    slug: 'graduation',
    name: 'Graduation',
    eyebrow: 'Senior portraits',
    startingAt: 425,
    durationLabel: '60 minutes',
    summary: 'A grown-up portrait for a grown-up moment.',
    description:
      'For high school and college seniors. Two looks, one location, an image set that will outlast every yearbook photo.',
    includes: ['60 minutes of coverage', 'Two outfits', '30+ edited images'],
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
