import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkqzcjqmjxbdfeizmffd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcXpjanFtanhiZGZlaXptZmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTA0ODIsImV4cCI6MjA5MDYyNjQ4Mn0.6h5mk5HI5wcaLjfPSaUYUt__Cc4tTSIyzKdL-Hrih0s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
