"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { ADMIN_LOGIN_HREF, isAdminEmail } from "../services/auth";

const INVALID_LOGIN = "Correo o contraseña incorrectos.";

// Receives FormData, not (email, password): in development Next logs Server Action
// arguments to the terminal, and a plain string password would show up there
export const signInAdmin = async (
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const cleanEmail = String(formData.get("email") ?? "").trim().toLowerCase();
  const cleanPassword = String(formData.get("password") ?? "");
  if (!cleanEmail || !cleanPassword) return { ok: false, error: INVALID_LOGIN };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword,
  });

  // Same message for every failure: don't reveal which emails exist or are admins
  if (error || !isAdminEmail(data.user?.email)) {
    if (!error) await supabase.auth.signOut();
    return { ok: false, error: INVALID_LOGIN };
  }

  return { ok: true };
};

export const signOutAdmin = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ADMIN_LOGIN_HREF);
};
