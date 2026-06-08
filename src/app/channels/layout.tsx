import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CommunityServer from "@/components/layout/app/communityServer";
import PrimarySidebar from "@/src/components/layout/app/primarySidebar";
import SidebarContent from "./sidebarContent";
import ProfileWidget from "@/src/components/layout/app/profileWidget";
import { getUserById, setStatus } from "@/lib/db/queries";
import AblyWrapper from "@/src/components/layout/app/ably/AblyWrapper";
import HeaderName from "./HeaderName";

export const metadata: Metadata = {
  title: "Messaging App",
  description:
    "A barebones messaging app built with Next.js 13, Prisma, and NextAuth.js.",
};

async function getPageData() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    redirect("/login");
  }

  return { user };
}

export default async function ChannelsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getPageData();

  console.log("User status:", user);

  if (user.status !== "ONLINE") {
    try {
      await setStatus(user.email!, "ONLINE");
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  }

  return (
    <AblyWrapper displayName={user.displayName}>
      <div className="flex min-h-screen w-full flex-col antialiased">
        <div className="flex h-8 w-full items-center justify-center px-[0.5rem] text-sm">
          <HeaderName />
        </div>
        <div className="flex min-h-0 w-full flex-1 items-stretch justify-start">
          <div className="relative flex h-full shrink-0 flex-col items-start justify-start">
            <div className="flex min-h-0 h-full w-auto flex-1 items-stretch justify-start">
              <CommunityServer />
              <PrimarySidebar>
                <SidebarContent userId={user.id} />
              </PrimarySidebar>
            </div>
            <ProfileWidget
              displayName={user.displayName}
              email={user.email}
              status={user.status}
              username={user.username}
            />
          </div>
          <div className="flex min-w-0 flex-1 self-stretch">{children}</div>
          <div id="modal-root"></div>
        </div>
      </div>
    </AblyWrapper>
  );
}
