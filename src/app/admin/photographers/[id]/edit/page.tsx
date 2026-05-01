import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PhotographerForm } from '../../PhotographerForm';
import { updatePhotographer, type State } from '../../actions';

export const metadata = { title: 'Edit photographer · Admin' };

export default async function EditPhotographer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from('photographers').select('*').eq('id', id).single();
  if (!p) notFound();

  const bound = updatePhotographer.bind(null, p.id) as unknown as (
    prev: State,
    fd: FormData,
  ) => Promise<State>;

  return (
    <PhotographerForm
      action={bound}
      submitLabel="Save changes →"
      photographer={{
        id: p.id,
        public_name: p.public_name,
        public_bio: p.public_bio ?? '',
        order_index: p.order_index,
        active: p.active,
      }}
    />
  );
}
