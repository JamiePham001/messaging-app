import type { NextAuthConfig } from "next-auth";

// Edge-compatible config — no Prisma adapter, no bcrypt
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    signOut: "/register",
  },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
};
