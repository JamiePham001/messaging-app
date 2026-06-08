import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messaging App",
  description:
    "A barebones messaging app built with Next.js 13, Prisma, and NextAuth.js.",
};

export default async function ServerLayout({
  children,
  sidebar,
}: Readonly<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
}>) {
  return (
    <div className="flex min-w-0 flex-1 self-stretch antialiased [border-top:1px_solid_DimGray]">
      {children}
      {sidebar}
      <div id="create-channel-group-modal"></div>
      <div id="create-server-channel-modal"></div>
      <div id="server-invite-modal"></div>
    </div>
  );
}
