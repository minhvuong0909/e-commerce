import { createClient, SupabaseClient } from '@supabase/supabase-js'
import argv from 'minimist'

// config trên production
const options = argv(process.argv.slice(2))
export const isProduction = Boolean(options.production)

const stripEnv = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '')

let supabaseClient: SupabaseClient | null = null

export const getSupabaseConfig = () => {
  if (!supabaseClient) {
    const url = stripEnv(process.env.SUPABASE_URL)
    const key = stripEnv(process.env.SUPABASE_ANON_KEY)
    supabaseClient = createClient(url, key)
  }
  return supabaseClient
}

/** @deprecated use getSupabaseConfig() — kept for existing imports */
export const supabaseConfig = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabaseConfig(), prop, getSupabaseConfig())
  }
})
