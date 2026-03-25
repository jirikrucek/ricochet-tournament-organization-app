import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = !!(supabaseUrl && supabaseKey);

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
);

export const checkSupabaseReachability = async () => {
    if (!isConfigured) {
        throw new Error(
            'Cannot connect to Supabase: Missing required environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
        );
    }
    const { error } = await supabase.from('tournaments').select('id').limit(1);
    if (error) throw error;
};
