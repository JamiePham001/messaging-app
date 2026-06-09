import ProfilePicture from "@/src/components/layout/app/profilePicture";
import checkUserChannelHook from "./checkUserChannel";
import { ChannelProvider, usePresenceListener } from "ably/react";

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

export default function All({ data }: { data: UserChannel[] }) {
  return (
    <ChannelProvider channelName="online-status">
      <AllInner data={data} />
    </ChannelProvider>
  );
}

function AllInner({ data }: { data: UserChannel[] }) {
  const { checkUserChannel, loading } = checkUserChannelHook();

  const { presenceData } = usePresenceListener("online-status");

  const onlineIds = new Set(presenceData.map((m) => m.clientId));

  return (
    <div className="w-full h-full flex flex-col p-[2rem] pt-[1rem] gap-[1rem]">
      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-[1rem] mt-[2rem]">
          <p className="text-[gray]">
            Add friends to start connecting with others!
          </p>
        </div>
      ) : (
        <>
          <div>All Friends - {data.length}</div>
          <div className="flex flex-col items-center w-full">
            {data.map((user) =>
              onlineIds.has(user.id) ? (
                <div key={user.id} className=" w-full ">
                  <hr className="border-none h-[1px] bg-[DimGray] w-full self-center" />
                  <button
                    onClick={() => checkUserChannel(user)}
                    disabled={loading}
                    className="group flex justify-between items-center p-[0.5rem] rounded-[0.5rem] cursor-pointer hover:bg-[var(--test)] w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-[1rem]">
                      <ProfilePicture username={user.displayName} />
                      <div className="flex flex-col">
                        <p>{user.displayName}</p>
                        <p className="text-[gray] text-[0.8rem] self-start">
                          Online
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div key={user.id} className=" w-full ">
                  <hr className="border-none h-[1px] bg-[DimGray] w-full self-center" />
                  <button
                    onClick={() => checkUserChannel(user)}
                    disabled={loading}
                    className="group flex justify-between items-center p-[0.5rem] rounded-[0.5rem] cursor-pointer hover:bg-[var(--test)] w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-[1rem]">
                      <ProfilePicture username={user.displayName} />
                      <div className="flex flex-col">
                        <p>{user.displayName}</p>
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
        </>
      )}
    </div>
  );
}
