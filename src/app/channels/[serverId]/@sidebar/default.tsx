// Fallback rendered when a nested route (e.g. /[channelId]) doesn't have its own @sidebar slot.
"use client";
import { useParams } from "next/navigation";
import MemberSidebar from "@/src/components/layout/app/communityServer/MemberSidebar";

export default function DefaultSidebar() {
  const params = useParams<{ serverId: string }>();
  const serverId = params?.serverId;

  return (
    <>
      {serverId ? (
        <div className="h-full w-[19rem] flex flex-col bg-[var(--secondary)]">
          <header className="h-[3rem] w-full flex items-center pl-[0.5rem] pr-[0.5rem] gap-[0.5rem] [border-bottom:1px_solid_DimGray]">
            <input
              type="text"
              placeholder="search"
              className="w-full px-2 rounded-md bg-[#0a0a0a] border border-[dimgray] focus:outline-none focus:ring-2 "
            />
          </header>
          <div className=" h-full w-full">
            <MemberSidebar serverId={serverId} />
          </div>
        </div>
      ) : null}
    </>
  );
}
