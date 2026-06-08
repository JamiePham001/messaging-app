import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { IUser, IRoles, IServerGroup, IServer } from "@/src/types";
import ProfilePicture from "../layout/app/profilePicture";

interface ModalProps {
  onClose: () => void;
  serverName: string;
  serverId: string;
}

export default function ServerInvite({
  onClose,
  serverName,
  serverId,
}: ModalProps) {
  const handleCloseClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClose();
  };
  const { data: session } = useSession();

  const [userSearchInput, setUserSearchInput] = useState("");
  const [friendsList, setFriendsList] = useState<IUser[]>([]);

  const serverLink = `localhost:3000/channels/${serverId}`;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`/api/friends/get/${session?.user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          console.error("Failed to fetch friends list");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setFriendsList(data.friends);
        } else {
          console.error("Error fetching friends list:", data.message);
        }
      } catch (error) {
        console.error("Error fetching friends list:", error);
      }
    };
    fetchFriends();
  }, [session?.user.id]);

  const modalContent = (
    <div
      className="absolute top-0 left-0 w-[100%] h-[100%] flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-[1000]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Wrap the whole Modal inside the newly created StyledModalWrapper
              and use the ref */}
      <motion.div
        className="w-[400px] bg-[var(--primary)] rounded-[8px] p-[0.5rem] bg-[var(--secondary)]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.333, ease: "easeInOut" }}
      >
        <div className="bg-[var(--primary)] w-full h-full rounded-[8px] p-[1rem] flex flex-col gap-[1rem]">
          <div className="grid grid-cols-[1fr_5fr_1fr]">
            <div></div>
            <h1 className="text-center text-[1.3rem] flex ">
              Invite friends to
              <div className="test-bold-900 px-[0.3rem]">{serverName}</div>
            </h1>
            <a
              href="#"
              onClick={handleCloseClick}
              className="justify-self-end cursor-pointer"
            >
              x
            </a>
          </div>

          <div className="w-full h-full flex">
            <div className="w-full h-full flex-col flex items-center gap-[1rem]">
              <input
                id="server-name-input"
                type="text"
                placeholder="Search for friends"
                onChange={(e) => setUserSearchInput(e.target.value)}
                value={userSearchInput}
                className="w-full p-[0.5rem] rounded-[6px] bg-[var(--test)] text-white focus:outline-none"
              />
              <div className="flex flex-col w-full justify-between h-[20rem] overflow-y-auto">
                {friendsList.filter(
                  (friend) =>
                    friend.displayName
                      .toLowerCase()
                      .includes(userSearchInput.toLowerCase()) ||
                    friend.username
                      .toLowerCase()
                      .includes(userSearchInput.toLowerCase()),
                ).length === 0 && (
                  <p className="text-center text-[gray] mt-[2rem]">
                    No friends found matching &quot;{userSearchInput}&quot;
                  </p>
                )}
                {friendsList
                  .filter(
                    (friend) =>
                      friend.displayName
                        .toLowerCase()
                        .includes(userSearchInput.toLowerCase()) ||
                      friend.username
                        .toLowerCase()
                        .includes(userSearchInput.toLowerCase()),
                  )
                  .map((friend) => (
                    <div key={friend.id} className=" w-full ">
                      <hr className="border-none h-[1px] bg-[DimGray] w-full self-center" />
                      <div className="group flex justify-between items-center p-[0.5rem] rounded-[0.5rem] cursor-pointer hover:bg-[var(--test)] w-full disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="flex items-center gap-[1rem]">
                          <ProfilePicture username={friend.username} />
                          <div className="flex flex-col">
                            <p>{friend.displayName}</p>
                            <p className="text-[gray] text-[0.8rem] self-start">
                              {friend.username}
                            </p>
                          </div>
                        </div>

                        <button className="px-[0.5rem] py-[0.25rem] bg-[var(--test)] text-white rounded-[4px] cursor-pointer hover:bg-[var(--hover)]">
                          Invite
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div
                className={`flex transition ease-in delay-100 duration-100 w-full gap-[0.5rem] mt-auto p-[0.5rem] rounded-[6px] ${copied ? "[border:1px_solid_green]" : "[border:1px_solid_var(--test)]"}`}
              >
                <div className="serverLink w-full overflow-x-auto text-ellipsis">
                  {serverLink}
                </div>
                <button
                  className={`px-[0.5rem] transition ease-in delay-100 duration-100 py-[0.25rem] text-white rounded-[4px] cursor-pointer ${copied ? "bg-green-600 hover:bg-green-700" : "bg-[var(--button)] hover:bg-[var(--button-hover)]"}`}
                  onClick={() => {
                    navigator.clipboard.writeText(serverLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById("server-invite-modal") as HTMLElement,
  );
}
