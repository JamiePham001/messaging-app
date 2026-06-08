import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const deadEndRoutes = ["/channels", "/discovery"];

export default auth((req) => {
  const pathname = req.nextUrl.pathname.replace(/\/$/, "") || "/";

  if (deadEndRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/not-found", req.url));
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/channels", "/channels/:path*", "/discovery"],
};
