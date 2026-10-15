import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

// Secret-key client: bypasses RLS. Server-only (orders, stock); never import it from a
// Client Component and never use it to serve data a visitor shouldn't see.
export const createAdminClient = () => {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Falta SUPABASE_SECRET_KEY en .env.local");
  }

  return createClient<Database>(supabaseEnv.url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
