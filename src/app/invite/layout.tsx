import type { Metadata } from "next";
import "@/src/app/globals.css";

export const metadata: Metadata = {
  title: "Messaging App",
  description:
    "A barebones messaging app built with Next.js 13, Prisma, and NextAuth.js.",
};

export default function InviteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-full antialiased flex flex-col">{children}</div>;
}
