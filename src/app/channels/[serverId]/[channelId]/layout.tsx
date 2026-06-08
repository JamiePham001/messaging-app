import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messaging App",
  description:
    "A barebones messaging app built with Next.js 13, Prisma, and NextAuth.js.",
};

export default async function ServerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-w-0 flex-1 self-stretch antialiased">
      {children}
    </div>
  );
}
