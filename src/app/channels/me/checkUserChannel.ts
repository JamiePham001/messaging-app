import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface IUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  status: string;
}

interface IChannel {
  id: string;
  friendshipId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserChannel extends IUser {
  channels: IChannel[];
}

// Checks if a channel exists for the friendship, if not creates one and updates the friendship with the channel id, then redirects to the channel
export default function useCheckUserChannel() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function checkChatHistory(user: UserChannel) {
    if (loading) return;
    if (!session?.user?.id) return;
    if (!user) return;

    try {
      const res = await fetch(`/api/channels/get/friend?friendId=${user.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        throw new Error(`Error fetching channel: ${res.statusText}`);
      }

      const data = await res.json();
      const channel = data.channel;
      return channel;
    } catch (error) {
      console.error(error);
    }
  }

  async function checkUserChannel(user: UserChannel) {
    if (loading) return;
    if (!session?.user?.id) return;
    const channel = await checkChatHistory(user);
    if (!channel) {
      setLoading(true);
      fetch(`/api/channels/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendId: user.id,
          sessionUserId: session?.user?.id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const channelId = data.channel?.id;
          if (channelId) {
            router.push(`/channels/me/${channelId}`);
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      router.push(`/channels/me/${channel.id}`);
    }
  }

  return { checkUserChannel, loading };
}
