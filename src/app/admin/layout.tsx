import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/(auth)/actions';

const TABS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/requests', label: 'Requests' },
  { href: '/admin/slots', label: 'Slots' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/photographers', label: 'Photographers' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/journal', label: 'Journal' },
  { href: '/admin/testimonials', label: 'Testimonials' },
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
        <p className="text-ash text-t-12 eyebrow-label mb-4">Studio admin</p>
        <h1 className="font-serif text-t-36 leading-tight">{profile.full_name ?? profile.email}</h1>
      </header>

      <nav className="border-y border-mist mb-12 overflow-x-auto">
        <div className="max-w-content mx-auto px-6 flex items-center justify-between gap-6 min-w-max md:min-w-0">
          <ul className="flex gap-6 text-t-14 whitespace-nowrap">
            {TABS.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className="block py-4 hover:text-accent transition-colors duration-300"
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-6 whitespace-nowrap">
            <Link
              href="/account"
              className="text-t-12 eyebrow-label text-ash hover:text-accent transition-colors duration-300"
            >
              ← Account
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-t-12 eyebrow-label text-ash hover:text-accent">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-content mx-auto px-6">{children}</main>
    </div>
  );
}
