import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wgnjcsjdylaajmerwtwd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_iJXmz2Q-_GpvA1TWywX5Kg_eD9TdHOs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
