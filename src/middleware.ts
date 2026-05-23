import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Build an edge-safe auth wrapper from the base config (no bcrypt/Prisma).
const { auth } = NextAuth(authConfig);

// Protect /dashboard and /profile. Everything else stays public for now.
export default auth((req) => {
  const isAuthed = !!req.auth;
  const url = req.nextUrl;
  const protectedPath =
    url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/profile");
  if (protectedPath && !isAuthed) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("from", url.pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
