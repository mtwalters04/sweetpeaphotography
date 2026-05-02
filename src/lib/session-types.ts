import { SERVICES } from '@/lib/content/services';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

function parseDurationMinutes(label: string): number {
  const match = label.match(/\d+/);
  if (!match) return 60;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

export async function ensureSessionTypesSeeded(
  supabase: SupabaseClient<Database>,
): Promise<void> {
  const { count, error: countError } = await supabase
    .from('session_types')
    .select('id', { count: 'exact', head: true });

  if (countError || (count ?? 0) > 0) return;

  const rows = SERVICES.map((service, index) => ({
    slug: service.slug,
    name: service.name,
    eyebrow: service.eyebrow,
    summary: service.summary,
    description: service.description,
    duration_minutes: parseDurationMinutes(service.durationLabel),
    starting_at_cents: service.startingAt * 100,
    deposit_pct: 0.3,
    includes: [...service.includes],
    order_index: index,
    active: true,
  }));

  await supabase
    .from('session_types')
    .upsert(rows, { onConflict: 'slug', ignoreDuplicates: false });
}
