import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/questions",
  "/quizzes",
  "/profile",
  "/ai",
  "/settings",
  "/study-planner",
  "/progress",
  "/notifications",
  "/subscription",
  "/teacher",
  "/admin",
];

const publicAuthRoutes = ["/login", "/register"];
const PUBLIC_FILE = /\.(?:png|jpg|jpeg|webp|gif|svg|ico|css|js|map|txt|xml|json|webmanifest|woff2?)$/;

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("gansekou_token")?.value;
  const hasToken = Boolean(token && token.length > 100);

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicAuth = publicAuthRoutes.some((route) => pathname === route);

  if (isPublicAuth && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-gansekou-auth-proxy", hasToken ? "session" : "guest");
  response.headers.set("x-gansekou-auth-proxy-check", isProtected ? "protected-client-verified" : "public");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/questions/:path*",
    "/quizzes/:path*",
    "/profile/:path*",
    "/ai/:path*",
    "/settings/:path*",
    "/study-planner/:path*",
    "/progress/:path*",
    "/notifications/:path*",
    "/subscription/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
