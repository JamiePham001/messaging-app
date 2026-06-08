"use client";

import { ChannelProvider, usePresence } from "ably/react";

function PresenceInner({ userId }: { userId: string }) {
  usePresence("online-status", { userId });
  return null;
}

// Mounts inside AblyWrapper. Enters the shared presence channel so the user
// is visible as "online" to all their friends. Renders nothing.
export default function PresenceEnter({ userId }: { userId: string }) {
  return (
    <ChannelProvider channelName="online-status">
      <PresenceInner userId={userId} />
    </ChannelProvider>
  );
}
