import { createClient } from '@/lib/supabase/server';
import { ensureSessionTypesSeeded } from '@/lib/session-types';
import { DayAvailabilityForm } from '../DayAvailabilityForm';
import { createDaySlots } from '../actions';

export const metadata = { title: 'Publish day · Admin' };

export default async function NewSlotPage() {
  const supabase = await createClient();
  await ensureSessionTypesSeeded(supabase);
  const [{ data: services }, { data: existingSlots }] = await Promise.all([
    supabase
      .from('session_types')
      .select('id, name, duration_minutes, active')
      .order('order_index'),
    supabase
      .from('available_slots')
      .select('starts_at, status, session_types(name)')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true }),
  ]);

  const dayMap = new Map<
    string,
    { date: string; sessionName: string; activeCount: number; cancelledCount: number }
  >();
  for (const slot of existingSlots ?? []) {
    const day = new Date(slot.starts_at).toISOString().slice(0, 10);
    if (!dayMap.has(day)) {
      dayMap.set(day, {
        date: day,
        sessionName: slot.session_types?.name ?? 'Existing session',
        activeCount: 0,
        cancelledCount: 0,
      });
    }
    if (slot.status === 'cancelled') {
      dayMap.get(day)!.cancelledCount += 1;
    } else {
      dayMap.get(day)!.activeCount += 1;
    }
  }

  return (
    <DayAvailabilityForm
      action={createDaySlots}
      serviceOptions={(services ?? []).map((s) => ({
        value: s.id,
        label: s.active ? s.name : `${s.name} (inactive)`,
        durationMinutes: s.duration_minutes,
      }))}
      existingDays={Array.from(dayMap.values())}
    />
  );
}
