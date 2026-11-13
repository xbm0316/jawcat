import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://juccucvigabuxgyonoeb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_3j-Hl8cWaqDce3FIpRc8og_GzH3AuNN'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
