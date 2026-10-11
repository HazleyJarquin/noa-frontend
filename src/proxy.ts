import { NextResponse, type NextRequest } from "next/server";
import {
  VISITOR_ID_COOKIE,
  VISITOR_ID_HEADER,
  VISITOR_ID_MAX_AGE,
} from "@/shared/flags/visitor-id";

// Assigns every visitor a stable id for GrowthBook targeting and experiments.
// Pages can't set cookies while rendering, so it has to happen here.
export function proxy(request: NextRequest) {
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

  return response;
}

export const config = {
  // Skip static assets and image optimization
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico)$).*)"],
};
