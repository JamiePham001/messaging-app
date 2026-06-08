import { DefaultSession } from "next-auth";

declare module "*.css";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
