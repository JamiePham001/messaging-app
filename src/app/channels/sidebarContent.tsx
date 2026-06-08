"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import DMSidebar from "@/src/components/layout/app/primarySidebar/dmSidebar";
import ServerContent from "@/src/components/layout/app/primarySidebar/serverContent";

export default function SidebarContent({
  userId,
}: {
  userId?: string | undefined;
}) {
  const segment = useSelectedLayoutSegment();

  if (segment === "me" || segment === null) {
    return <DMSidebar userId={userId} />;
  }

  if (segment === "discovery/servers") {
    return <div>discovery content</div>;
  }

  return <ServerContent />;
}
