import { TestimonialForm } from '../TestimonialForm';
import { createTestimonial } from '../actions';

export const metadata = { title: 'New testimonial · Admin' };

export default function NewTestimonialPage() {
  return (
    <TestimonialForm
      action={createTestimonial}
      submitLabel="Create →"
      testimonial={{
        id: null,
        quote: '',
        attribution: '',
        context: '',
        featured: false,
        approved: false,
        order_index: 0,
      }}
    />
  );
}
