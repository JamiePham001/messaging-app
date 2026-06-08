"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBox from "@/src/components/layout/app/ably/ChatBox";
import { ChatRoomProvider } from "@ably/chat/react";

interface IChannel {
  id: string;
  updatedAt: Date;
  visible: boolean;
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

export default function DirectMessage() {
  const params = useParams<{ channelId: string }>();
  const channelId = params?.channelId;
  const router = useRouter();

  const [chatData, setChatData] = useState<IChatData | null>(null);

  useEffect(() => {
    if (!channelId) {
      router.push(`/channels/me`);
      return;
    }

    const fetchChatData = async () => {
      try {
        fetch(`/api/channels/get/${channelId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setChatData(data.channel);
            console.log("Fetched chat data:", data.channel);
          })
          .catch((err) => {
            console.error(err);
            router.push(`/channels/me`);
          });
      } catch (error) {
        console.error("Error fetching chat data:", error);
        router.push(`/channels/me`);
      }
    };

    fetchChatData();
  }, [channelId, router]);

  // set channel to visible on the sidebar if it's currently invisible
  if (chatData) {
    if (chatData.visible === false) {
      fetch("/api/channels/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelId, visible: true }),
      });
    }
  }

  return (
    <>
      {channelId ? (
        <ChatRoomProvider name={channelId}>
          <ChatBox chatData={chatData} channelId={channelId} />
        </ChatRoomProvider>
      ) : null}
    </>
  );
}
