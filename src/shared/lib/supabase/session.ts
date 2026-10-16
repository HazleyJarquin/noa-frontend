import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

type SessionCookie = { name: string; value: string; options: CookieOptions };

// Refreshes the Supabase auth session (access token lasts 1h). Must run in the proxy:
// pages can't set cookies while rendering.
// - Updates request.cookies so the page about to render sees the NEW token
//   (refresh tokens are single-use: if the page saw the old one it would try again and fail).
// - Returns the cookies the proxy must also set on the response for the browser.
export const refreshSupabaseSession = async (request: NextRequest): Promise<SessionCookie[]> => {
  const toSet: SessionCookie[] = [];

  const supabase = createServerClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          toSet.push({ name, value, options });
        });
      },
    },
  });

  // Validates the JWT and refreshes it when needed
  await supabase.auth.getClaims();
  return toSet;
};
