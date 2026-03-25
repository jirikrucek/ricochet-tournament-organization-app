import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        'Missing required Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const checkSupabaseReachability = async () => {
    const { error } = await supabase.from('tournaments').select('id').limit(1);
    if (error) throw error;
};
