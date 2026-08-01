import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This client uses the SERVICE ROLE key, which bypasses Row-Level Security.
// It must NEVER be imported into any "use client" component — only into
// API routes (files under src/app/api/), which run exclusively on the server.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);