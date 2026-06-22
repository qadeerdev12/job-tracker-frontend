import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://upffrlumzpcysyoreruw.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZmZybHVtenBjeXN5b3JlcnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NzM0NjksImV4cCI6MjA5NzE0OTQ2OX0.NUC_G6cm26KAllPYcDxVpCjWcHZlMvHmWegYUWGBD1U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
