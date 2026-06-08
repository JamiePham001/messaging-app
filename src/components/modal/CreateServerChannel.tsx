import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import type {
  IUser,
  IRoles,
  IServerGroup,
  IServer,
  IChannel,
} from "@/src/types";

interface ModalProps {
  onClose: () => void;
  serverId: string;
  SCGId: string;
  setServerChannels: React.Dispatch<React.SetStateAction<IServerGroup[]>>;
}

const pageDetails = [
  {
    title: "Create Channel",
  },
  {
    title: "Add members or roles",
  },
];

export default function CreateServerChannel({
  onClose,
  serverId,
  SCGId,
  setServerChannels,
}: ModalProps) {
  const handleCloseClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClose();
  };
  const { data: session } = useSession();

  const backBtn = document.getElementById("back-button");
  const createBtn = document.getElementById("create-server-button");
  const inputField = document.getElementById(
    "channel-name-input",
  ) as HTMLInputElement | null;
  const toggleBtns = (visible: boolean) => {
    if (visible) {
      backBtn?.removeAttribute("disabled");
      createBtn?.removeAttribute("disabled");
      inputField?.removeAttribute("disabled");
    } else {
      backBtn?.setAttribute("disabled", "true");
      createBtn?.setAttribute("disabled", "true");
      inputField?.setAttribute("disabled", "true");
    }
  };

  const [pageIndex, setPageIndex] = useState(0);
  const [privateCheck, setPrivateCheck] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateCheck(event.target.checked); // event.target.checked is true/false
  };

  const [roles, setRoles] = useState<IRoles[]>([]);
  const [serverMembers, setServerMembers] = useState<IUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleMemberSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const memberId = e.target.value;

    setSelectedMembers((prevSelected) =>
      e.target.checked
        ? [...prevSelected, memberId]
        : prevSelected.filter((id) => id !== memberId),
    );
  };

  const handleRoleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const roleId = e.target.value;

    setSelectedRoles((prevSelected) =>
      e.target.checked
        ? [...prevSelected, roleId]
        : prevSelected.filter((id) => id !== roleId),
    );
  };

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
        const rolesData = data.roles.filter(
          (role: IRoles) => role.role !== "owner",
        );
        setRoles(rolesData);
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
        // remove current user from members pool. Dont need to be a viewable and selectable option
        const filterUseres = serverData.users.filter(
          (user) => user.id !== session?.user?.id,
        );
        setServerMembers(filterUseres);
      } catch (error) {
        console.error("Error fetching server members:", error);
      }
    };

    fetchRoles();
    fetchMembers();
  }, [serverId, session?.user?.id]);

  const createChannel = async () => {
    setLoading(true);
    toggleBtns(true);
    // add current user to selected members if private category so they don't lock themselves out
    if (privateCheck) {
      setSelectedMembers((prevSelected) => [
        ...prevSelected,
        session?.user?.id as string,
      ]);
    }

    try {
      const res = await fetch("/api/server/channel/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SCGId: SCGId,
          name: channelName,
          serverId: serverId,
          exclusiveUserIds: selectedMembers,
          exclusiveRolesIds: selectedRoles,
        }),
      });

      if (!res.ok) {
        console.error("Failed to create channel:", res.status);
        toggleBtns(false);
        return;
      }

      const data = await res.json();
      const newChannel = data.channel as IChannel;
      setServerChannels((prevGroups) =>
        prevGroups.map((group) =>
          group.id === SCGId
            ? { ...group, channels: [...(group.channels ?? []), newChannel] }
            : group,
        ),
      );
      console.log("Channel created successfully:", data);
    } catch (error) {
      console.error("Error creating channel:", error);
    } finally {
      setLoading(false);
      toggleBtns(false);
      onClose();
    }
  };

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
            <h1 className="text-center text-[1.3rem]">
              {pageDetails[pageIndex].title}
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
            {/* {groupId} */}
            {pageIndex === 0 && (
              <div className="w-full h-full flex-col flex items-center gap-[1rem]">
                <input
                  id="channel-name-input"
                  type="text"
                  placeholder="Channel Name"
                  onChange={(e) => setChannelName(e.target.value)}
                  value={channelName}
                  className="w-full p-[0.5rem] rounded-[6px] bg-[var(--test)] text-white focus:outline-none"
                />
                <div className="flex w-full justify-between">
                  <div className=" flex flex-col gap-[0.5rem]">
                    <div className="flex items-center gap-[1rem]">
                      <h3 className="">Private Channel</h3>
                      <input
                        type="checkbox"
                        className=""
                        checked={privateCheck}
                        onChange={handleCheck}
                      ></input>
                    </div>
                  </div>
                </div>

                <div className="flex w-full gap-[0.5rem] mt-auto">
                  <button
                    onClick={() => {
                      onClose();
                      setChannelName("");
                      setPrivateCheck(false);
                    }}
                    className="w-full p-[0.5rem] bg-[var(--test)] rounded-[6px] cursor-pointer text-white hover:bg-[dimgray]"
                  >
                    Cancel
                  </button>
                  {privateCheck ? (
                    <button
                      onClick={() => {
                        setPageIndex(pageIndex + 1);
                      }}
                      className={`w-full p-[0.5rem] bg-[var(--button)] rounded-[6px]  text-white  ${channelName ? "hover:bg-[var(--button-hover)] cursor-pointer" : "opacity-50"}`}
                      disabled={channelName ? false : true}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      id="create-server-button"
                      className={`w-full p-[0.5rem] bg-[var(--button)] rounded-[6px]  text-white  ${channelName ? "hover:bg-[var(--button-hover)] cursor-pointer" : "opacity-50"}`}
                      disabled={channelName ? false : true}
                      onClick={() => createChannel()}
                    >
                      Create Channel
                    </button>
                  )}
                </div>
              </div>
            )}

            {pageIndex === 1 && (
              <div className="w-full flex flex-col justify-between h-full">
                <div className="flex gap-[0.5rem] pb-[1rem]">
                  Channel: <div className="text-[gray]">{channelName}</div>
                </div>
                {loading && <p>Creating server...</p>}
                <div className="w-full h-full flex-col flex gap-[1rem]">
                  <div className="flex w-full h-[18rem] flex-col gap-[0.5rem] overflow-y-auto">
                    <div className="roles">
                      {roles.length === 0 ? null : (
                        <div className="flex flex-col">
                          <h3 className="font-bold">Roles</h3>
                          <div className=" flex flex-col gap-[0.5rem]">
                            {roles.map((role) => (
                              <label
                                key={role.id}
                                htmlFor={`role-${role.id}`}
                                className="flex items-center gap-[0.5rem] hover:bg-[var(--test)] rounded pl-[0.5rem] cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  id={`role-${role.id}`}
                                  onChange={(e) => handleRoleSelect(e)}
                                  value={role.id}
                                  className=""
                                />
                                <div className="font-semibold text-sm">
                                  {role.role}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="members">
                      {serverMembers.length === 0 ? null : (
                        <div className="flex flex-col">
                          <h3 className="font-bold">Members</h3>
                          <div className="flex flex-col gap-[0.5rem]">
                            {serverMembers.map((member) => (
                              <label
                                key={member.id}
                                htmlFor={`member-${member.id}`}
                                className="flex items-center gap-[0.5rem] hover:bg-[var(--test)] rounded px-[0.5rem] py-[0.25rem] cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  id={`member-${member.id}`}
                                  onChange={(e) => handleMemberSelect(e)}
                                  value={member.id}
                                  className=""
                                />
                                <div className="font-semibold text-sm">
                                  {member.displayName}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex w-full gap-[0.5rem] [border-top:1px_solid_DimGray] pt-[1.5rem]">
                    <button
                      id="back-button"
                      onClick={() => {
                        setPageIndex(pageIndex - 1);
                      }}
                      className="w-full p-[0.5rem] bg-[var(--test)] rounded-[6px] cursor-pointer text-white hover:bg-[dimgray]"
                    >
                      Back
                    </button>
                    {selectedMembers.length === 0 &&
                    selectedRoles.length === 0 ? (
                      <button
                        id="create-server-button"
                        onClick={() => createChannel()}
                        className={`w-full p-[0.5rem] bg-[cornflowerblue] rounded-[6px]  text-white  ${loading ? "hover:bg-[var(--button-hover)] cursor-pointer" : "opacity-50"}`}
                        disabled={loading}
                      >
                        Skip
                      </button>
                    ) : (
                      <button
                        id="create-server-button"
                        onClick={() => createChannel()}
                        className={`w-full p-[0.5rem] bg-[var(--button)] rounded-[6px]  text-white  ${loading ? "hover:bg-[var(--button-hover)] cursor-pointer" : "opacity-50"}`}
                        disabled={loading}
                      >
                        Create Channel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById("create-server-channel-modal") as HTMLElement,
  );
}
