'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import { dollarsToCents } from '@/lib/money';

export type State = { error: string | null; saved: boolean };

async function rowFromForm(fd: FormData) {
  const { supabase } = await requireStaff();

  const session_type_id = String(fd.get('session_type_id') ?? '');
  const photographer_id = String(fd.get('photographer_id') ?? '') || null;

  // Default duration + price from session type if not overridden.
  const { data: type } = await supabase
    .from('session_types')
    .select('duration_minutes, starting_at_cents')
    .eq('id', session_type_id)
    .single();

  const startsAt = String(fd.get('starts_at') ?? '');
  const dur = Number(fd.get('duration_minutes') ?? 0) || type?.duration_minutes || 60;
  const priceDollars = String(fd.get('price_dollars') ?? '');
  const price = priceDollars ? dollarsToCents(priceDollars) : (type?.starting_at_cents ?? 0);

  return {
    session_type_id,
    photographer_id,
    starts_at: new Date(startsAt).toISOString(),
    duration_minutes: dur,
    price_cents: price,
    location_label: String(fd.get('location_label') ?? '').trim() || null,
    notes: String(fd.get('notes') ?? '').trim() || null,
  };
}

export async function createSlot(_prev: State, fd: FormData): Promise<State> {
  let id: string;
  try {
    const r = await rowFromForm(fd);
    if (!r.session_type_id) return { error: 'Service is required.', saved: false };
    if (!r.starts_at) return { error: 'Start time is required.', saved: false };
    const { supabase } = await requireStaff();
    const { data, error } = await supabase
      .from('available_slots')
      .insert({ ...r, status: 'open' })
      .select('id')
      .single();
    if (error) return { error: error.message, saved: false };
    id = data.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/slots');
  redirect(`/admin/slots/${id}/edit`);
}

export async function updateSlot(id: string, _prev: State, fd: FormData): Promise<State> {
  try {
    const r = await rowFromForm(fd);
    const { supabase } = await requireStaff();
    const { error } = await supabase.from('available_slots').update(r).eq('id', id);
    if (error) return { error: error.message, saved: false };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }
  revalidatePath('/admin/slots');
  return { error: null, saved: true };
}

export async function deleteSlot(id: string): Promise<void> {
  const { supabase } = await requireStaff();
  // Refuse if a booking exists for this slot.
  const { data: booking } = await supabase
    .from('bookings')
    .select('id')
    .eq('slot_id', id)
    .maybeSingle();
  if (booking) throw new Error('Slot has a booking. Cancel the booking first.');
  await supabase.from('available_slots').delete().eq('id', id);
  revalidatePath('/admin/slots');
  redirect('/admin/slots');
}

export async function setSlotStatus(
  id: string,
  status: 'open' | 'cancelled',
): Promise<void> {
  const { supabase } = await requireStaff();
  await supabase
    .from('available_slots')
    .update({
      status,
      hold_expires_at: null,
      held_by_user: null,
    })
    .eq('id', id);
  revalidatePath('/admin/slots');
}
