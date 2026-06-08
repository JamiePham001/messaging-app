"use client";

import * as Ably from "ably";
import { ChatClient, LogLevel } from "@ably/chat";
import { ChatClientProvider } from "@ably/chat/react";
import { AblyProvider } from "ably/react";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PresenceEnter from "./PresenceEnter";

export default function AblyWrapper({
  children,
  displayName,
}: {
  children: React.ReactNode;
  displayName?: string | null;
}) {
  const { data: session } = useSession();
  const [realtimeClient, setRealtimeClient] = useState<Ably.Realtime | null>(
    null,
  );
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);

  useEffect(() => {
    const clientId = session?.user?.id;

    if (!clientId) return;

    const params = new URLSearchParams({ clientId });
    if (displayName) params.set("displayName", displayName);

    const realtimeClient = new Ably.Realtime({
      authCallback: async (_tokenParams, callback) => {
        try {
          const res = await fetch(`/api/ably-auth?${params.toString()}`);
          if (!res.ok) throw new Error("Auth failed");
          callback(null, await res.text());
        } catch (err) {
          callback(String(err), null);
        }
      },
      clientId,
    });

    const ablyChatClient = new ChatClient(realtimeClient, {
      logLevel: LogLevel.Error,
    });

    const initializeChatClient = async () => {
      try {
        setRealtimeClient(realtimeClient);
        setChatClient(ablyChatClient);
      } catch (error) {
        console.error("Failed to connect to Ably:", error);
      }
    };

    initializeChatClient();

    return () => {
      realtimeClient.close();
    };
  }, [session?.user?.id, displayName]);

  if (!chatClient || !realtimeClient) {
    return null;
  }

  return (
    <AblyProvider client={realtimeClient}>
      <ChatClientProvider client={chatClient}>
        <PresenceEnter userId={session!.user!.id} />
        {children}
      </ChatClientProvider>
    </AblyProvider>
  );
}
