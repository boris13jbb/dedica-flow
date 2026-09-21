import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

let adminClient: ReturnType<typeof createClient<Database>> | undefined

/**
 * Server-side admin client with service role key.
 * USE WITH CAUTION - bypasses RLS.
 * Only use when absolutely necessary for admin operations.
 */
export function createAdminClient() {
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}
