import React from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IServer } from "@/src/types";

interface ModalProps {
  onClose: () => void;
  setServers: React.Dispatch<React.SetStateAction<IServer[]>>;
}

const pageDetails = [
  {
    title: "Server Type",
    description:
      "Choose between a server just for friends or a larger community.",
  },
  {
    title: "Server Name",
    description: "Give your server a name that represents your community.",
  },
];

const Modal = ({ onClose, setServers }: ModalProps) => {
  const { data: sessionData } = useSession();
  const router = useRouter();

  // modal states
  const [publicServerType, setPublicServerType] = useState<boolean>(false);
  const [serverName, setServerName] = useState<string>("");
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCloseClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClose();
  };

  const backBtn = document.getElementById("back-button");
  const createBtn = document.getElementById("create-server-button");
  const inputField = document.getElementById(
    "server-name-input",
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

  const createServer = async (
    publicServerType: boolean,
    serverName: string,
    userId: string,
  ) => {
    toggleBtns(false);
    setLoading(true);
    try {
      const server = await fetch("/api/server/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: serverName,
          publicType: publicServerType,
          sessionUserId: userId,
        }),
      });

      const rawData = await server.json();
      if (!rawData.success) {
        console.error("Failed to create server:", rawData.message);
        return;
      }
      const serverData = rawData.server;

      const serverRole = await fetch("/api/server/roles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId: serverData.id,
          userId: sessionData?.user?.id,
          role: "Owner",
          admin: true,
        }),
      });

      const roleRawData = await serverRole.json();
      if (!roleRawData.success) {
        console.error("Failed to assign server role:", roleRawData.message);
        return;
      }

      const serverChannelGroup = await fetch(
        "/api/server/channelGroup/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serverId: serverData.id,
            name: "Text Channels",
          }),
        },
      );

      const scgRawData = await serverChannelGroup.json();
      if (!scgRawData.success) {
        console.error(
          "Failed to create server channel group:",
          scgRawData.message,
        );
        return;
      }

      const channelGroupData = scgRawData.serverGroup;

      const channel = await fetch("/api/server/channel/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SCGId: channelGroupData.id,
          name: "general",
          serverType: true,
        }),
      });

      const channelRawData = await channel.json();
      if (!channelRawData.success) {
        console.error(
          "Failed to create general channel:",
          channelRawData.message,
        );
        return;
      }

      const channelData = channelRawData.channel;

      setServers((prevServers) => [...prevServers, serverData]);
      onClose();
      toggleBtns(true);
      router.push(`/channels/${serverData.id}/${channelData.id}`);
    } catch (error) {
      console.error("Failed to create server:", error);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="absolute top-0 left-0 w-[100%] h-[100%] flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-[1000]"
      id="overlay"
      onClick={(e) => {
        const overlay = document.getElementById("overlay");
        if (e.target === overlay) {
          onClose();
        }
      }}
    >
      {/* Wrap the whole Modal inside the newly created StyledModalWrapper
            and use the ref */}
      <motion.div
        className="w-[400px] h-[300px] bg-[var(--primary)] rounded-[8px] p-[0.5rem] bg-[var(--secondary)]"
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

          <h2 className="text-center text-[0.9rem] ">
            {pageDetails[pageIndex].description}
          </h2>

          <div className="w-full h-full flex">
            {pageIndex === 0 && (
              <div className="w-full h-full flex-col flex items-center gap-[1rem]">
                <button
                  onClick={() => {
                    setPublicServerType(true);
                    setPageIndex(pageIndex + 1);
                  }}
                  className="w-full p-[0.5rem] bg-[var(--test)] rounded-[6px] cursor-pointer text-white hover:bg-[dimgray]"
                >
                  For a club or community
                </button>
                <button
                  onClick={() => {
                    setPublicServerType(false);
                    setPageIndex(pageIndex + 1);
                  }}
                  className="w-full p-[0.5rem] bg-[var(--test)] rounded-[6px] cursor-pointer text-white hover:bg-[dimgray]"
                >
                  For me & my friends
                </button>
              </div>
            )}

            {pageIndex === 1 && (
              <div className="w-full h-full flex flex-col items-center gap-[1rem] pt-[1rem]">
                <input
                  id="server-name-input"
                  type="text"
                  placeholder="Server Name"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full p-[0.5rem] rounded-[6px] bg-[var(--test)] text-white focus:outline-none"
                />
                {loading && <p>Creating server...</p>}
                <div className="w-full flex items-center justify-between mt-auto">
                  <button
                    id="back-button"
                    onClick={() => setPageIndex(pageIndex - 1)}
                    className="self-start cursor-pointer text-white hover:text-[dimgray]"
                  >
                    back
                  </button>
                  <button
                    id="create-server-button"
                    onClick={(e) => {
                      e.preventDefault();
                      createServer(
                        publicServerType,
                        serverName,
                        sessionData?.user?.id || "",
                      );
                    }}
                    className="w-[6rem] p-[0.5rem] bg-[var(--test)] rounded-[6px] cursor-pointer text-white hover:bg-[dimgray]"
                  >
                    Create
                  </button>
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
    document.getElementById("modal-root") as HTMLElement,
  );
};

export default Modal;
