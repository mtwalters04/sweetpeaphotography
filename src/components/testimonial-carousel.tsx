'use client';

import { useState } from 'react';
import type { Testimonial } from '@/lib/content/testimonials';

export function TestimonialCarousel({ testimonials }: { testimonials: readonly Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  if (total === 0) return null;
  const current = testimonials[index]!;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="border border-mist bg-vellum/45 p-8 md:p-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <p className="text-ash text-t-12 eyebrow-label">From recent clients</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="h-8 w-8 border border-mist text-ash hover:text-ink hover:border-ash/70 transition-colors"
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="h-8 w-8 border border-mist text-ash hover:text-ink hover:border-ash/70 transition-colors"
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>
      </div>

      <blockquote className="font-serif text-[clamp(1.2rem,2.1vw,1.55rem)] leading-[1.38] text-ink tracking-[-0.01em] font-light min-h-[9.5em]">
        <span className="text-ash/70 not-italic">“</span>
        {current.quote}
        <span className="text-ash/70 not-italic">”</span>
      </blockquote>

      <p className="text-t-14 text-ash mt-8 leading-relaxed border-t border-mist/90 pt-6">
        <span className="font-serif italic text-ash/70 mr-2">—</span>
        {current.attribution}
        <span className="text-ash/45 mx-2">·</span>
        <span className="text-ash/85">{current.context}</span>
      </p>

      <div className="mt-5 flex items-center gap-2" aria-hidden>
        {testimonials.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-ash/85' : 'w-2 bg-mist'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
