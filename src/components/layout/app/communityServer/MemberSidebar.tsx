import { ChannelProvider, usePresenceListener } from "ably/react";
import ProfilePicture from "@/src/components/layout/app/profilePicture";
import checkUserChannelHook from "../../../../app/channels/me/checkUserChannel";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface IUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  status: string;

  userRoles: IRoles[];
  channels: IChannel[];
}

// neccessary for checkUserChannelHook to work
interface IChannel {
  id: string;
  friendshipId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IServer {
  id: string;
  name: string;

  users: IUser[];
}

interface IRoles {
  id: string;
  role: string;
  admin: boolean;
  createdAt: Date;

  users: IUser[];
}

export default function MemberSidebar({ serverId }: { serverId: string }) {
  return (
    <ChannelProvider channelName="online-status">
      <InnerMemberSidear serverId={serverId} />
    </ChannelProvider>
  );
}

function InnerMemberSidear({ serverId }: { serverId: string }) {
  const { checkUserChannel, loading } = checkUserChannelHook();
  const { presenceData } = usePresenceListener("online-status");
  const { data: session } = useSession();

  const [roles, setRoles] = useState<IRoles[]>([]);
  const [serverMembers, setServerMembers] = useState<IUser[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(
          `/api/server/roles/get/serverId?serverId=${serverId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          console.error("Failed to fetch roles:", res.status);
          return;
        }

        const data = await res.json();
        setRoles(data.roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/server/get?serverId=${serverId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch server members:", res.status);
          return;
        }

        const data = await res.json();
        const serverData = data.server as IServer;
        const modifiedData = serverData.users.map((user) => ({
          ...user,
          userRoles: user.userRoles.filter((role) => role.role !== "Owner"),
        }));
        setServerMembers(modifiedData);
      } catch (error) {
        console.error("Error fetching server members:", error);
      }
    };

    fetchRoles();
    fetchMembers();
  }, [serverId]);

  const onlineIds = new Set(presenceData.map((m) => m.clientId));
  // const onlineFriends = data.filter((user) => onlineIds.has(user.id));

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      {roles.map((role) => (
        <section key={role.id}>
          {role.users.filter((user) => onlineIds.has(user.id)).length > 0 && (
            <div className="pb-[1rem]">
              <div className="text-[var(--subtitle)] px-[1rem] pt-[0.5rem]">
                {`${role.role} -  
                 ${role.users.filter((user) => onlineIds.has(user.id)).length}`}
              </div>
              {serverMembers.map(
                (member) =>
                  member.userRoles[0]?.role === role.role &&
                  onlineIds.has(member.id) && (
                    <div key={member.id} className=" w-full px-[0.5rem] ">
                      <button
                        onClick={() => checkUserChannel(member)}
                        disabled={loading}
                        className="group flex justify-between items-center py-[0.25rem] px-[0.5rem] rounded-[0.5rem] cursor-pointer hover:bg-[var(--test)] w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-[1rem]">
                          <ProfilePicture username={member.displayName} />
                          <div className="flex flex-col">
                            <p>{member.displayName}</p>
                            <p className="text-[gray] text-[0.8rem] self-start">
                              Online
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  ),
              )}
            </div>
          )}
        </section>
      ))}

      {serverMembers.filter(
        (user) => onlineIds.has(user.id) && user.userRoles.length === 0,
      ).length > 0 && (
        <div className="w-full pb-[1rem]">
          <div className="text-[var(--subtitle)] px-[1rem] pt-[0.5rem]">
            {`Online -
                ${
                  serverMembers.filter(
                    (user) =>
                      onlineIds.has(user.id) && user.userRoles.length === 0,
                  ).length
                }`}
          </div>
          {serverMembers.map(
            (member) =>
              member.userRoles.length === 0 &&
              onlineIds.has(member.id) && (
                <div key={member.id} className="w-full px-[0.5rem]">
                  <button
                    onClick={() => checkUserChannel(member)}
                    disabled={loading}
                    className="group flex justify-between items-center py-[0.25rem] px-[0.5rem] rounded-[0.5rem] cursor-pointer hover:bg-[var(--test)] w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-[1rem]">
                      <ProfilePicture username={member.displayName} />
                      <div className="flex flex-col">
                        <p>{member.displayName}</p>
                        <p className="text-[gray] text-[0.8rem] self-start">
                          Online
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ),
          )}
        </div>
      )}

      {serverMembers.filter((user) => !onlineIds.has(user.id)).length > 0 && (
        <div className="text-[var(--subtitle)] px-[1rem] pt-[0.5rem]">
          {`Offline -
                ${serverMembers.filter((user) => !onlineIds.has(user.id)).length}`}
          <div className=""></div>
          {serverMembers.map(
            (member) =>
              !onlineIds.has(member.id) && (
                <div key={member.id} className=" w-full ">
                  <button
                    onClick={() => checkUserChannel(member)}
                    disabled={loading}
                    className="group flex justify-between items-center py-[0.25rem] rounded-[0.5rem] cursor-pointer hover:bg-[var(--test)] w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-[1rem]">
                      <ProfilePicture username={member.displayName} />
                      <div className="flex flex-col">
                        <p>{member.displayName}</p>
                        <p className="text-[gray] text-[0.8rem] self-start">
                          Offline
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
