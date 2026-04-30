import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin' };

// Phase 2 placeholder. Real admin UI lands in Phase 3+.
export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin' && profile?.role !== 'photographer') {
    redirect('/account');
  }

  return (
    <div className="pt-[clamp(112px,14vw,176px)] pb-[clamp(96px,12vw,192px)] max-w-content mx-auto px-6">
      <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-4">Admin</p>
      <h1 className="font-serif text-t-48 leading-tight">Studio dashboard.</h1>
      <p className="text-t-18 text-ash mt-6 max-w-prose">
        Signed in as {profile?.full_name ?? profile?.email} — role:{' '}
        <span className="text-ink">{profile?.role}</span>.
      </p>
      <p className="text-t-16 text-ash mt-10 max-w-prose">
        The admin dashboard lands in Phase 3 — booking pipeline, slot publishing, custom request
        triage. This page exists to confirm the access gate works.
      </p>
    </div>
  );
}
