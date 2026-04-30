'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ProfileState = { error: string | null; saved: boolean };

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in.', saved: false };

  const fullName = String(formData.get('full_name') ?? '').trim() || null;
  const phone = String(formData.get('phone') ?? '').trim() || null;

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone })
    .eq('id', user.id);

  if (error) return { error: error.message, saved: false };

  revalidatePath('/account');
  revalidatePath('/account/profile');
  return { error: null, saved: true };
}
