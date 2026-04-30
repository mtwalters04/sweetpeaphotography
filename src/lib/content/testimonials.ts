export type Testimonial = {
  quote: string;
  attribution: string;
  context: string;
};

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      'They moved through our wedding the way good guests do — present, attentive, never in the way. The photographs we have a year later still feel like the day did.',
    attribution: 'Iris M.',
    context: 'Wedding · 2025',
  },
  {
    quote:
      'I have never enjoyed being photographed. They made an hour pass in fifteen minutes. The portraits look like a version of me I had not met yet.',
    attribution: 'Wren A.',
    context: 'Graduation portrait · 2025',
  },
  {
    quote:
      'Both kids are easier with two photographers in the room than with one. We will not book it any other way.',
    attribution: 'The Marrow family',
    context: 'Annual portrait · 2025',
  },
];
