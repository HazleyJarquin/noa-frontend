import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

export const ADMIN_LOGIN_HREF = "/admin/login";

// Having a Supabase account isn't enough: the email must also be listed in ADMIN_EMAILS
export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
};

// Current admin from the session cookies (validated JWT), or null
export const getAdminUser = async () => {
  // Supabase calls Date.now() while validating the JWT, which cacheComponents rejects
  // during prerender: mark this as request-time first
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;
  if (!isAdminEmail(email)) return null;
  return { id: data!.claims.sub, email: email as string };
};

// For admin pages and actions: no admin session → login
export const requireAdmin = async () => {
  const admin = await getAdminUser();
  if (!admin) redirect(ADMIN_LOGIN_HREF);
  return admin;
};
