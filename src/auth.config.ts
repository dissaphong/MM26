import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no bcrypt, no Prisma. Shared by the middleware (Edge runtime)
// and the full auth instance (Node runtime). The Credentials provider — which
// needs bcrypt + Prisma — is added only in auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.uid && session.user) {
        (session.user as { id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
