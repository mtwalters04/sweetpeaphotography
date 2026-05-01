import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ServiceForm } from '../../ServiceForm';
import { updateService, type State } from '../../actions';

export const metadata = { title: 'Edit service · Admin' };

export default async function EditService({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: s } = await supabase.from('session_types').select('*').eq('id', id).single();
  if (!s) notFound();

  const bound = updateService.bind(null, s.id) as unknown as (
    prev: State,
    fd: FormData,
  ) => Promise<State>;

  return (
    <ServiceForm
      action={bound}
      submitLabel="Save changes →"
      service={{
        id: s.id,
        slug: s.slug,
        name: s.name,
        eyebrow: s.eyebrow ?? '',
        summary: s.summary ?? '',
        description: s.description ?? '',
        duration_minutes: s.duration_minutes,
        starting_at_dollars: s.starting_at_cents / 100,
        deposit_pct: Number(s.deposit_pct),
        includes: s.includes.join('\n'),
        order_index: s.order_index,
        active: s.active,
      }}
    />
  );
}
