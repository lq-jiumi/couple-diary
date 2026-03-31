import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://idzxcizpkvqjkaourmix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkenhjaXpwa3Zxamthb3VybWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTA0NTYsImV4cCI6MjA5MDQyNjQ1Nn0.X0Y0naq1A7OSr2PzJNsFs7-QiwNFE3M49rThWofoO04';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
