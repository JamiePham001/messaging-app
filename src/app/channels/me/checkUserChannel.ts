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

  function checkUserChannel(user: UserChannel) {
    if (loading) return;
    if (!session?.user?.id) return;
    if (user?.channels.length === 0) {
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
      router.push(`/channels/me/${user.channels[0].id}`);
    }
  }

  return { checkUserChannel, loading };
}
