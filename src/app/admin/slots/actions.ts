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

const TIME_24H = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseTimes(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const explicitValues = trimmed
    .split(/\r?\n|,/g)
    .map((line) => line.trim())
    .filter(Boolean);

  const fromRegex = Array.from(trimmed.matchAll(/([01]\d|2[0-3]):([0-5]\d)/g)).map(
    (match) => match[0],
  );

  const values = explicitValues.length > 1 ? explicitValues : fromRegex;
  const unique = Array.from(new Set(values));
  const invalid = unique.find((value) => !TIME_24H.test(value));
  if (invalid || unique.length === 0) {
    throw new Error(`Invalid time "${trimmed}". Use 24-hour HH:MM format.`);
  }
  return unique.sort();
}

export async function createDaySlots(_prev: State, fd: FormData): Promise<State> {
  try {
    const { supabase } = await requireStaff();
    const session_type_id = String(fd.get('session_type_id') ?? '').trim();
    if (!session_type_id) return { error: 'Session type is required.', saved: false };

    const day = String(fd.get('day') ?? '').trim();
    if (!day) return { error: 'Date is required.', saved: false };

    const timeLines = String(fd.get('times') ?? '');
    const times = parseTimes(timeLines);
    if (times.length === 0) return { error: 'Add at least one time.', saved: false };

    const photographer_id = String(fd.get('photographer_id') ?? '').trim() || null;

    const { data: type } = await supabase
      .from('session_types')
      .select('duration_minutes, starting_at_cents')
      .eq('id', session_type_id)
      .single();
    if (!type) return { error: 'Selected session type does not exist.', saved: false };

    const durationRaw = String(fd.get('duration_minutes') ?? '').trim();
    const priceRaw = String(fd.get('price_dollars') ?? '').trim();
    const duration_minutes = durationRaw ? Number(durationRaw) : type.duration_minutes;
    const price_cents = priceRaw ? dollarsToCents(priceRaw) : type.starting_at_cents;
    if (!Number.isFinite(duration_minutes) || duration_minutes < 15) {
      return { error: 'Duration must be at least 15 minutes.', saved: false };
    }

    const location_label = String(fd.get('location_label') ?? '').trim() || null;
    const notes = String(fd.get('notes') ?? '').trim() || null;

    const dayStart = new Date(`${day}T00:00:00`);
    const dayEnd = new Date(`${day}T23:59:59.999`);
    const { data: existingSlots, error: existingError } = await supabase
      .from('available_slots')
      .select('id, starts_at, session_type_id, status')
      .gte('starts_at', dayStart.toISOString())
      .lte('starts_at', dayEnd.toISOString());
    if (existingError) return { error: existingError.message, saved: false };

    const activeSlots = (existingSlots ?? []).filter((slot) => slot.status !== 'cancelled');
    if (activeSlots.some((slot) => slot.session_type_id !== session_type_id)) {
      return {
        error:
          'This day already has a different session type. Keep one session type per day or cancel existing slots first.',
        saved: false,
      };
    }

    const startsAtRows = times.map((time) => {
      const startsAt = new Date(`${day}T${time}`);
      if (Number.isNaN(startsAt.getTime())) {
        throw new Error(`Invalid date/time "${day} ${time}".`);
      }
      return {
        starts_at: startsAt.toISOString(),
        time,
      };
    });

    const existingStarts = new Set(activeSlots.map((slot) => slot.starts_at));
    const duplicate = startsAtRows.find((row) => existingStarts.has(row.starts_at));
    if (duplicate) {
      return {
        error: `A slot already exists at ${duplicate.time} on this day.`,
        saved: false,
      };
    }

    const insertRows = startsAtRows.map((row) => ({
      session_type_id,
      photographer_id,
      starts_at: row.starts_at,
      duration_minutes,
      price_cents,
      location_label,
      notes,
      status: 'open' as const,
    }));

    const { error } = await supabase.from('available_slots').insert(insertRows);
    if (error) return { error: error.message, saved: false };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error.', saved: false };
  }

  revalidatePath('/admin/slots');
  revalidatePath('/book');
  return { error: null, saved: true };
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
