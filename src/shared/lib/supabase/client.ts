import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

// Browser client, only for client-side needs such as realtime or auth UI
export const createClient = () =>
  createBrowserClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey);
