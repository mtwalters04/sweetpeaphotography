import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TestimonialForm } from '../../TestimonialForm';
import { updateTestimonial, type State } from '../../actions';

export const metadata = { title: 'Edit testimonial · Admin' };

export default async function EditTestimonial({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: t } = await supabase.from('testimonials').select('*').eq('id', id).single();
  if (!t) notFound();

  const bound = updateTestimonial.bind(null, t.id) as unknown as (
    p: State,
    fd: FormData,
  ) => Promise<State>;

  return (
    <TestimonialForm
      action={bound}
      submitLabel="Save changes →"
      testimonial={{
        id: t.id,
        quote: t.quote,
        attribution: t.attribution,
        context: t.context ?? '',
        featured: t.featured,
        approved: t.approved,
        order_index: t.order_index,
      }}
    />
  );
}
