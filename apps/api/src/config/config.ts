import { createClient } from '@supabase/supabase-js'
import argv from 'minimist'

// config này để chạy trên production
const options = argv(process.argv.slice(2))
export const isProduction = Boolean(options.production)

// config supabase
export const supabaseConfig = createClient(
  process.env.SUPABASE_URL || ('' as string),
  process.env.SUPABASE_ANON_KEY || ('' as string)
)
