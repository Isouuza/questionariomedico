import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mwvrgwkvtwpqpcqoekcb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dnJnd2t2dHdwcXBjcW9la2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTAwNjksImV4cCI6MjA4ODQ4NjA2OX0.pbSzGU1CAtBp2hRDMFmyu-4FNqcxcsk-qMO7jelVztk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);