import type { Metadata } from "next";
import { Providers } from "@/components/contexts/AuthContext";
import { auth } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Messaging App",
  description:
    "A barebones messageging app built with Next.js 13, Prisma, and NextAuth.js.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="h-full antialiased">
      {/* suppressHydrationWarning is used to prevent hydration mismatch errors from Grammerly injecting itself into the body */}
      <body className="flex h-full flex-col" suppressHydrationWarning>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
