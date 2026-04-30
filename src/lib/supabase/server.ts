import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv, serviceRoleKey } from './env';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component context — ignore. Middleware handles refresh.
        }
      },
    },
  });
}

export function createAdminClient() {
  return createServerClient(supabaseEnv.url, serviceRoleKey(), {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
