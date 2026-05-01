import { createClient } from './supabase/server';

export type StaffContext = {
  userId: string;
  role: 'photographer' | 'super_admin';
  supabase: Awaited<ReturnType<typeof createClient>>;
};

export async function requireStaff(): Promise<StaffContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'photographer' && profile?.role !== 'super_admin') {
    throw new Error('Forbidden.');
  }
  return { userId: user.id, role: profile.role, supabase };
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  return { userId: user.id, supabase };
}
