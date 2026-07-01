"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBox from "@/src/components/layout/app/ably/ChatBox";
import { ChatRoomProvider } from "@ably/chat/react";
import MemberSidebar from "@/src/components/layout/app/communityServer/MemberSidebar";
import { getCached, setCache } from "@/lib/utils/cache";

const SERVER_CHANNELS_CACHE_KEY = "server-channels";

interface IChannel {
  id: string;
  updatedAt: Date;
  visible: boolean;
  name?: string;
  messages: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    sender: ISender;
  }[];
}

interface IUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: string;
}

interface ISender {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: string;
}

interface IChatData extends IChannel {
  users: IUser[];
}

export default function ServerPage() {
  const params = useParams<{ serverId: string; channelId?: string }>();
  const [chatData, setChatData] = useState<IChatData | null>(null);
  const serverId = params?.serverId;
  const router = useRouter();

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const cacheKey = `${SERVER_CHANNELS_CACHE_KEY}::${serverId}`;
        const cachedChannels = getCached<IChannel[]>(cacheKey);

        if (cachedChannels && cachedChannels.length > 0) {
          setChatData(cachedChannels[0] as unknown as IChatData);
          return;
        }

        const res = await fetch(
          `/api/channels/get/serverId?serverId=${serverId}`,
        );
        if (!res.ok) {
          console.error("Failed to fetch channel data:", res.status);
          router.push("/channels/me");
          return;
        }
        const data = await res.json();

        const channelData = data.channels;
        setCache(cacheKey, channelData);

        setChatData(channelData[0]);
      } catch (error) {
        console.error("Error fetching channel data:", error);
        router.push("/channels/me");
      }
    };

    fetchChatData();
  }, [serverId, router]);

  return (
    <>
      {serverId && chatData?.id ? (
        <ChatRoomProvider name={chatData.id}>
          <main className="flex h-full w-full bg-[var(--secondary)]">
            <ChatBox
              channelId={chatData?.id || ""}
              chatData={chatData}
              isServer={true}
            ></ChatBox>
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
          </main>
        </ChatRoomProvider>
      ) : null}
    </>
  );
}
