import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login?callbackUrl=/admin", req.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/dealer", req.url));
  }
  if (pathname.startsWith("/dealer")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login?callbackUrl=/dealer", req.url));
    if (role !== "DEALER") return NextResponse.redirect(new URL("/admin", req.url));
  }
  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*", "/dealer/:path*"] };