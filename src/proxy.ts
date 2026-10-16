import { NextResponse, type NextRequest } from "next/server";
import {
  VISITOR_ID_COOKIE,
  VISITOR_ID_HEADER,
  VISITOR_ID_MAX_AGE,
} from "@/shared/flags/visitor-id";
import { refreshSupabaseSession } from "@/shared/lib/supabase/session";

// Runs before every page. Pages can't set cookies while rendering, so it has to happen here:
// - assigns every visitor a stable id for GrowthBook targeting and experiments
// - keeps the admin panel's Supabase login session fresh
export async function proxy(request: NextRequest) {
  // Refresh first: it updates request.cookies, which the headers below are copied from
  const sessionCookies = request.nextUrl.pathname.startsWith("/admin")
    ? await refreshSupabaseSession(request)
    : [];

  const existingId = request.cookies.get(VISITOR_ID_COOKIE)?.value;
  const visitorId = existingId ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(VISITOR_ID_HEADER, visitorId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (!existingId) {
    response.cookies.set(VISITOR_ID_COOKIE, visitorId, {
      path: "/",
      maxAge: VISITOR_ID_MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
  }

  sessionCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));

  return response;
}

export const config = {
  // Skip static assets and image optimization
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico)$).*)"],
};
