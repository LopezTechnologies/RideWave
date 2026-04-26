import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — avoids throwing during Next.js build when env vars are not set
let _supabase: SupabaseClient | undefined

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    _supabase ??= createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    return Reflect.get(_supabase, prop, _supabase)
  },
})

// Cliente con service role para API routes (operaciones admin)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
