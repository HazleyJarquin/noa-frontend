import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

// Cookie-less client for public data (catalog, categories).
// It never reads the request, so it can be used inside "use cache" functions.
export const createPublicClient = () =>
  createClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
