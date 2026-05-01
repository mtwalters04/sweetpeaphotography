import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SlotForm } from '../../SlotForm';
import { updateSlot, type State } from '../../actions';

export const metadata = { title: 'Edit slot · Admin' };

// Convert ISO timestamp → "YYYY-MM-DDTHH:mm" local for datetime-local inputs.
const toLocalInput = (iso: string): string => {
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default async function EditSlot({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: slot }, { data: services }, { data: photographers }] = await Promise.all([
    supabase.from('available_slots').select('*').eq('id', id).single(),
    supabase
      .from('session_types')
      .select('id, name')
      .order('order_index'),
    supabase
      .from('photographers')
      .select('id, public_name')
      .order('order_index'),
  ]);
  if (!slot) notFound();

  const bound = updateSlot.bind(null, slot.id) as unknown as (
    prev: State,
    fd: FormData,
  ) => Promise<State>;

  return (
    <SlotForm
      action={bound}
      submitLabel="Save changes →"
      slot={{
        id: slot.id,
        session_type_id: slot.session_type_id,
        photographer_id: slot.photographer_id ?? '',
        starts_at_local: toLocalInput(slot.starts_at),
        duration_minutes: slot.duration_minutes,
        price_dollars: slot.price_cents / 100,
        location_label: slot.location_label ?? '',
        notes: slot.notes ?? '',
        status: slot.status,
        isPrivate: !!slot.private_for_user,
      }}
      serviceOptions={(services ?? []).map((s) => ({ value: s.id, label: s.name }))}
      photographerOptions={(photographers ?? []).map((p) => ({
        value: p.id,
        label: p.public_name,
      }))}
    />
  );
}
