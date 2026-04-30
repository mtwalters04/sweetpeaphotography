import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/account/profile');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, email')
    .eq('id', user.id)
    .single();

  return (
    <ProfileForm
      email={profile?.email ?? user.email ?? ''}
      initialFullName={profile?.full_name ?? ''}
      initialPhone={profile?.phone ?? ''}
    />
  );
}
