import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
// Fallback to hardcoded values for backward compatibility
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cbjqvyharuapekbchnun.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Qf_MbCpXpMqJR7_huhnW8Q_-BhM_0je';

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_KEY && 
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
    SUPABASE_KEY !== 'YOUR_SUPABASE_ANON_KEY');

// Validate configuration
if (!isSupabaseConfigured) {
    console.warn("⚠️ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
} else {
    // Note: Modern Supabase publishable keys start with "sb_publishable_" or "ey" (JWT format for anon keys)
    if (!SUPABASE_KEY.startsWith('ey') && !SUPABASE_KEY.startsWith('sb_publishable_')) {
        console.warn("⚠️ Supabase Key Warning: The provided key format looks unusual. Standard Supabase keys are JWTs (starting with 'ey') or publishable keys (starting with 'sb_publishable_'). Please verify in Supabase Dashboard > Settings > API > Project API Keys.");
    }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});