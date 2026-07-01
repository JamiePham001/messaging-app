"use client";
import ServerWidget from "@/src/components/elements/buttons/ServerWidget";
import Modal from "@/src/components/modal/createServer";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { IServer } from "@/src/types";
import { useParams } from "next/navigation";
import { getCached, setCache, invalidateCache } from "@/lib/utils/cache";

const SERVERS_CACHE_KEY = "servers";

export default function CommunityServer() {
  const [showModal, setShowModal] = useState(false);
  const [servers, setServers] = useState<IServer[]>([]);
  const { data: session } = useSession();

  const params = useParams<{ serverId: string }>();
  const serverId = params?.serverId;

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    // Check cache first
    const cachedServers = getCached<IServer[]>(SERVERS_CACHE_KEY);
    if (cachedServers && cachedServers.length > 0) {
      setServers(cachedServers);
      return;
    }

    const fetchServers = async () => {
      try {
        const response = await fetch(
          `/api/server/get/userId?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        if (!data.success) {
          console.error("Failed to fetch servers:", data.message);
          return;
        }

        setServers(data.servers);
        setCache(SERVERS_CACHE_KEY, data.servers);
      } catch (error) {
        console.error("Failed to fetch servers:", error);
      }
    };

    fetchServers();
  }, [userId, serverId]);

  // Invalidate cache when a new server is created or joined
  useEffect(() => {
    invalidateCache([SERVERS_CACHE_KEY]);
  }, []);

  return (
    <section className="flex flex-col items-center justify-start w-[4rem] h-full p-[0.5rem] gap-[0.5rem]">
      <ServerWidget
        url={"/channels/me"}
        serverName="Direct Messages"
        logo={"💬"}
      ></ServerWidget>
      <hr className="bg-[gray] w-[80%] border-none h-[0.5px]" />

      {servers.map((server) => (
        <ServerWidget
          key={server.id}
          url={`/channels/${server.id}/${server.channelGroups?.[0]?.channels?.[0]?.id || ""}`}
          serverName={server.name}
          logo={server.name.charAt(0).toUpperCase()}
          color={"var(--secondary)"}
        ></ServerWidget>
      ))}

      <div className="group relative inline-block h-[2.5rem] w-[2.5rem]  bg-[var(--secondary)] rounded-[10%]">
        <button
          onClick={() => setShowModal(true)}
          className="absolute inset-0 text-[1.5rem] cursor-pointer flex items-center justify-center"
        >
          +
        </button>

        <span className="pointer-events-none invisible absolute left-[calc(100%+8px)] top-1/2 w-[130px] -translate-y-1/2 rounded-[6px] bg-[DimGray] px-[0] py-[5px] text-center text-[#fff] opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 z-[999]">
          Add a Server
        </span>
      </div>
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          setServers={setServers}
        ></Modal>
      )}

      <ServerWidget
        url={"/discovery/servers"}
        serverName="Discover"
        logo={"🔍"}
        color={"var(--secondary)"}
      ></ServerWidget>
    </section>
  );
}
