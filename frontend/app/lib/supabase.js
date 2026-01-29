
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseUrl !== 'your_supabase_url' &&
    !supabaseUrl.includes('your_supabase_url');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
