import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // JWT verification happens server-side in the API routes.
    // The middleware only checks token presence for fast redirect.
    // A tampered token will fail at the API layer.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
