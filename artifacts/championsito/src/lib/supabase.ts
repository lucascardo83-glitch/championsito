import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wmipmpblxuobifugtmbl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtaXBtcGJseHVvYmlmdWd0bWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDQwNjYsImV4cCI6MjEwMzkyMDA2Nn0.K6MlC6NgFmK_x4FKC67lHr8tcwsOlXekz9UKZ0-C-jU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
