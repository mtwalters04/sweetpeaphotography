import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SlotForm } from '../SlotForm';
import { createSlot } from '../actions';

export const metadata = { title: 'New slot · Admin' };

export default async function NewSlotPage() {
  const supabase = await createClient();
  const [{ data: services }, { data: photographers }] = await Promise.all([
    supabase
      .from('session_types')
      .select('id, name')
      .eq('active', true)
      .order('order_index'),
    supabase
      .from('photographers')
      .select('id, public_name')
      .eq('active', true)
      .order('order_index'),
  ]);

  if (!services || services.length === 0) {
    redirect('/admin/services/new');
  }

  return (
    <SlotForm
      action={createSlot}
      submitLabel="Publish →"
      slot={{
        id: null,
        session_type_id: '',
        photographer_id: '',
        starts_at_local: '',
        duration_minutes: 0,
        price_dollars: 0,
        location_label: '',
        notes: '',
        status: 'open',
        isPrivate: false,
      }}
      serviceOptions={services.map((s) => ({ value: s.id, label: s.name }))}
      photographerOptions={
        photographers?.map((p) => ({ value: p.id, label: p.public_name })) ?? []
      }
    />
  );
}
