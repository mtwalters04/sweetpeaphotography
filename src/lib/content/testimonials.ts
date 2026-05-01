import { createClient } from '@/lib/supabase/server';

export type Testimonial = {
  quote: string;
  attribution: string;
  context: string;
};

// Fallback used when the DB has no approved testimonials yet (or is unreachable).
const FALLBACK: readonly Testimonial[] = [
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

// Static export so server pages with `'use client'` ancestors still work.
export const TESTIMONIALS = FALLBACK;

export async function getTestimonials(): Promise<readonly Testimonial[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('testimonials')
      .select('quote, attribution, context')
      .eq('approved', true)
      .order('featured', { ascending: false })
      .order('order_index')
      .limit(12);
    if (data && data.length > 0) {
      return data.map((t) => ({
        quote: t.quote,
        attribution: t.attribution,
        context: t.context ?? '',
      }));
    }
  } catch {
    // Fall through to static fallback.
  }
  return FALLBACK;
}
