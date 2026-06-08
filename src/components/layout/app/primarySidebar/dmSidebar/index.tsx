import { useState, useEffect } from "react";
import ProfilePicture from "@/components/layout/app/profilePicture";
import Link from "next/link";
import { ChannelProvider, usePresenceListener } from "ably/react";

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

  const { presenceData } = usePresenceListener("online-status");
  const onlineIds = new Set(presenceData.map((m) => m.clientId));

  useEffect(() => {
    if (!userId) return;

    const fetchUserChannels = async () => {
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
      }
    };
    fetchUserChannels();
  }, [userId]);

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const channelId = e.currentTarget.getAttribute("data-channel-id");
    if (!channelId) {
      console.error("Channel ID not found on form");
      return;
    }

    try {
      fetch("/api/channels/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelId }),
      });
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
                        <form
                          onSubmit={onSubmit}
                          method="PATCH"
                          data-channel-id={channel.id}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            type="submit"
                            className="flex items-center justify-center w-[2rem] h-[2rem] text-[1rem] cursor-pointer rounded-[2rem] text-DimGrey hover:text-white"
                          >
                            x
                          </button>
                        </form>
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
