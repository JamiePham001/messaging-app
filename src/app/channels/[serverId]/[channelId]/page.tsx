"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBox from "@/src/components/layout/app/ably/ChatBox";
import { ChatRoomProvider } from "@ably/chat/react";
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

export default function ChannelPage() {
  const params = useParams<{ serverId: string; channelId: string }>();
  const [chatData, setChatData] = useState<IChatData | null>(null);
  const serverId = params?.serverId;
  const channelId = params?.channelId;
  const router = useRouter();

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const cacheKey = `${SERVER_CHANNELS_CACHE_KEY}::${serverId}`;
        const cachedChannels = getCached<IChannel[]>(cacheKey);

        if (cachedChannels && cachedChannels.length > 0) {
          setChatData(
            (cachedChannels as unknown as IChatData[]).find((c: IChatData) => c.id === channelId) || null,
          );
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

        if (!channelId) {
          setChatData(channelData[0]);
        }

        setChatData(
          channelData.find((c: IChatData) => c.id === channelId) || null,
        );
      } catch (error) {
        console.error("Error fetching channel data:", error);
        router.push("/channels/me");
      }
    };

    fetchChatData();
  }, [serverId, channelId, router]);

  return (
    <>
      {channelId ? (
        <ChatRoomProvider name={channelId || ""}>
          <main className="flex h-full w-full bg-[var(--secondary)]">
            <ChatBox
              channelId={channelId}
              chatData={chatData}
              isServer={true}
            ></ChatBox>
          </main>
        </ChatRoomProvider>
      ) : null}
    </>
  );
}
