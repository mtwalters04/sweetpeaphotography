import { createClient } from '@/lib/supabase/server';
import { NavBar } from './nav-bar';

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <NavBar signedIn={!!user} />;
}
