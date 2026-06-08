"use client";
import ProfilePicture from "../profilePicture";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useChatConnection } from "@ably/chat/react";

export default function ProfileWidget(userData: {
  displayName: string | null;
  email: string;
  status: string | null;
  username: string | null;
}) {
  const { currentStatus } = useChatConnection();
  return (
    <section className="h-[3.5rem] w-full flex items-start justify-center pl-[0.5rem] pr-[0.5rem] pb-[0.3rem]">
      <div className="w-full h-full bg-[var(--secondary)] rounded-[0.5rem] p-[0.5rem] flex items-center justify-between">
        <div className="flex gap-[1rem] items-center justify-start">
          <ProfilePicture username={userData.displayName || ""} />
          <div className="flex flex-col items-start justify-start ">
            <div className="profile-name">{userData.displayName}</div>
            <div className="text-[0.8rem] text-[dimgray]">
              {currentStatus ? <div>Online</div> : <div>Offline</div>}
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="w-[2.5rem] h-[2.5rem] rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:bg-[var(--test)]"
        >
          <Image
            src="/assets/icons/signout.svg"
            alt="sign out"
            width={24}
            height={24}
          />
        </button>
      </div>
    </section>
  );
}
