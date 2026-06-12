import { useState, useEffect } from "react";
import ProfilePicture from "@/components/layout/app/profilePicture";
import Link from "next/link";
import { ChannelProvider, usePresenceListener } from "ably/react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { LoadingCursor } from "@/lib/utiils/cursor/loading";

interface IChannel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface IBaseUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: string;
  status: string;
}

interface IChannelWithUsers extends IChannel {
  users: IBaseUser[];
}

export default function DMSidebar({ userId }: { userId?: string }) {
  return (
    <ChannelProvider channelName="online-status">
      <InnerDMSidebar userId={userId} />
    </ChannelProvider>
  );
}

function InnerDMSidebar({ userId }: { userId?: string }) {
  const [channels, setChannels] = useState<IChannelWithUsers[]>([]);
  const [loading, setLoading] = useState(false);
  LoadingCursor(loading);

  const params = useParams<{ channelId: string }>();
  const channelId = params?.channelId;

  const { presenceData } = usePresenceListener("online-status");
  const onlineIds = new Set(presenceData.map((m) => m.clientId));

  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    const fetchUserChannels = async () => {
      setLoading(true);
      try {
        fetch(`/api/channels/get/user/${userId}`).then((res) =>
          res.json().then((data) => {
            if (!data.success) {
              console.error("Failed to fetch channels:", data.message);
              return;
            }
            setChannels(data.channel ?? []);
          }),
        );
      } catch (error) {
        console.error("Failed to fetch channels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserChannels();
  }, [userId]);

  useEffect(() => {
    if (!channelId) return;
    if (!userId) return;
    if (channels.find((c) => c.id === channelId)) return;

    const fetchUserChannels = async () => {
      setLoading(true);
      try {
        fetch(`/api/channels/get/user/${userId}`).then((res) =>
          res.json().then((data) => {
            if (!data.success) {
              console.error("Failed to fetch channels:", data.message);
              return;
            }
            setChannels(data.channel ?? []);
          }),
        );
      } catch (error) {
        console.error("Failed to fetch channels:", error);
      } finally {
        setLoading(false);
      }
    };

    const setVisible = async (channelId: string) => {
      try {
        const res = await fetch(`/api/channels/update`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ channelId, visible: true }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error(
            "Failed to update channel visibility:",
            errorData.message || res.statusText,
          );
          return;
        }

        const data = await res.json();

        if (!data.success) return;

        fetchUserChannels();
      } catch (error) {
        console.error("Failed to update channel visibility:", error);
      }
    };

    setVisible(channelId);
  }, [channelId, channels, userId]);

  const setInvisible = async (channelId: string) => {
    try {
      const res = await fetch(`/api/channels/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelId, visible: false }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error(
          "Failed to update channel visibility:",
          errorData.message || res.statusText,
        );
        return;
      }

      setChannels((prev) => prev.filter((c) => c.id !== channelId));
    } catch (error) {
      console.error("Failed to update channel visibility:", error);
    }
  };

  return (
    <div className="flex h-full w-full shrink-0 flex-col items-center justify-start">
      <div className="h-[3rem] font-bold w-full flex items-center pl-[1rem] gap-[0.5rem] [border-bottom:1px_solid_DimGray]">
        Direct Messages
      </div>
      <div className="h-full w-full ">
        {!channels || channels.length === 0 ? (
          <div className="flex flex-col items-center gap-[1rem] mt-[2rem]">
            <p className="text-[gray]">No available direct messages.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full p-[0.5rem]">
            {channels.length > 0 ? (
              <div className="flex flex-col items-center w-full">
                {channels.map((channel) => (
                  <div key={channel.id} className="w-full">
                    <Link
                      href={`/channels/me/${channel.id}`}
                      className="group flex justify-between items-center p-[0.5rem] rounded-[0.5rem] cursor-pointer hover:bg-[var(--test)]"
                    >
                      <div>
                        <div className="flex items-center gap-[1rem]">
                          <ProfilePicture
                            username={channel?.users?.[0]?.displayName ?? ""}
                          />
                          <div className="flex flex-col">
                            <p>{channel?.users?.[0]?.displayName}</p>
                            <p className="text-[gray] text-[0.8rem]">
                              {onlineIds.has(channel?.users?.[0]?.id)
                                ? "Online"
                                : "Offline"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInvisible(channel.id);
                              if (channelId === channel.id) {
                                router.push("/channels/me");
                              }
                            }}
                            type="button"
                            className="flex items-center justify-center w-[2rem] h-[2rem] text-[1rem] cursor-pointer rounded-[2rem] text-DimGrey hover:text-white"
                          >
                            x
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                No Direct Messages
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
