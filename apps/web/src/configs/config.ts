import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const PAGE = 1
export const ORDER_LIMIT = 5
export const PRODUCT_LIMIT = 5
export const LOW_STOCK_THRESHOLD = 5
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    storage: localStorage,
    persistSession: true,
    detectSessionInUrl: false
  }
})
