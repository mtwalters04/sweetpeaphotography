import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/(auth)/actions';

const TABS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/journal', label: 'Journal' },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <div className="pt-[clamp(112px,14vw,176px)] pb-[clamp(96px,12vw,192px)]">
      <header className="max-w-content mx-auto px-6 mb-8">
        <p className="text-ash text-t-12 uppercase tracking-[0.2em] mb-4">Studio admin</p>
        <h1 className="font-serif text-t-36 leading-tight">{profile.full_name ?? profile.email}</h1>
      </header>

      <nav className="border-y border-mist mb-12">
        <div className="max-w-content mx-auto px-6 flex items-center justify-between">
          <ul className="flex gap-8 text-t-14">
            {TABS.map((tab) => (
              <li key={tab.href}>
                <Link href={tab.href} className="block py-4 hover:text-accent transition-colors">
                  {tab.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/account"
                className="block py-4 text-ash hover:text-accent transition-colors"
              >
                ← Account
              </Link>
            </li>
          </ul>
          <form action={signOut}>
            <button
              type="submit"
              className="text-t-12 uppercase tracking-[0.2em] text-ash hover:text-accent"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-content mx-auto px-6">{children}</main>
    </div>
  );
}
