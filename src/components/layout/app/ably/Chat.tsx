"use client";

import * as Ably from "ably";
import { ChatClient } from "@ably/chat";
import { ChatClientProvider, ChatRoomProvider } from "@ably/chat/react";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Chat({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);

  useEffect(() => {
    const clientId = session?.user?.id;
    const realtimeClient = new Ably.Realtime({
      authUrl: `/api/ably-auth?clientId=${clientId}`,
      clientId,
    });
    const ablyChatClient = new ChatClient(realtimeClient);

    const initializeChatClient = async () => {
      try {
        setChatClient(ablyChatClient);
      } catch (error) {
        console.error("Failed to connect to Ably:", error);
      }
    };

    initializeChatClient();

    return () => {
      realtimeClient.close();
    };
  }, [session]);

  if (!chatClient) {
    return <div>Loading...</div>;
  }

  return (
    <ChatClientProvider client={chatClient}>
      <ChatRoomProvider name="default">{children}</ChatRoomProvider>
    </ChatClientProvider>
  );
}
