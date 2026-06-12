import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface ModalProps {
  onClose: () => void;
  serverName: string;
  serverId: string;
}

interface Invite {
  code: string;
  serverId: string;
  expiresAt: string;
  createdAt: string;
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

  const [inviteCode, setInviteCode] = useState<Invite | null>(null);

  const [copied, setCopied] = useState(false);

  const serverLink = `${process.env.NEXT_PUBLIC_URL}/invite/`;

  useEffect(() => {
    if (!session?.user.id) return;

    const createInvite = async () => {
      try {
        const res = await fetch("/api/server/invite/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ serverId }),
        });
        if (!res.ok) {
          console.error("Failed to create server invite");
          return;
        }
        const data = await res.json();
        if (!data.success) {
          console.error("Error creating server invite:", data.message);
          return;
        }
        setInviteCode(data.invite);
      } catch (error) {
        console.error("Error creating server invite:", error);
      }
    };

    const getInviteCode = async () => {
      try {
        const res = await fetch(`/api/server/invite/get?serverId=${serverId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.status === 404) {
          createInvite();
          return;
        }

        if (!res.ok) {
          console.error("failed to fetch server invite code");
          return;
        }

        const data = await res.json();

        if (!data.success) {
          console.error("Error fetching server invite code:", data.message);
          return;
        }

        if (
          data.invite.expiresAt &&
          new Date(data.invite.expiresAt) < new Date()
        ) {
          createInvite();
          return;
        }

        setInviteCode(data.invite);
      } catch (error) {
        console.error("Error fetching server invite code:", error);
        createInvite();
      }
    };

    getInviteCode();
  }, [session?.user.id, serverId]);

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
        className="w-[450px] bg-[var(--primary)] rounded-[8px] p-[0.5rem] bg-[var(--secondary)]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.333, ease: "easeInOut" }}
      >
        <div className="bg-[var(--primary)] w-full h-full rounded-[8px] p-[1rem] flex flex-col gap-[1rem]">
          <div className="grid grid-cols-[1fr_5fr_1fr]">
            <div></div>
            <h1 className="text-center text-[1.3rem] flex ">
              {`Invite friends to ${serverName}`}
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
              <div className="flex flex-col w-full ">
                Copy the invite link to share it with others.
              </div>

              <div
                className={`flex transition ease-in delay-100 duration-100 w-full gap-[0.5rem] mt-auto p-[0.5rem] rounded-[6px] ${copied ? "[border:1px_solid_green]" : "[border:1px_solid_var(--test)]"}`}
              >
                {inviteCode ? (
                  <>
                    <div className="serverLink w-full overflow-x-auto text-ellipsis x-overflow-hidden">
                      {`${serverLink}${inviteCode.code}`}
                    </div>
                    <button
                      className={`px-[0.5rem] transition ease-in delay-100 duration-100 py-[0.25rem] text-white rounded-[4px] cursor-pointer ${copied ? "bg-green-600 hover:bg-green-700" : "bg-[var(--button)] hover:bg-[var(--button-hover)]"}`}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${serverLink}${inviteCode.code}`,
                        );
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="serverLink w-full overflow-x-auto text-ellipsis x-overflow-hidden">
                      Generating invite link...
                    </div>
                    <button
                      className={`px-[0.5rem] transition ease-in delay-100 duration-100 py-[0.25rem] text-white rounded-[4px] cursor-pointer ${copied ? "bg-green-600 hover:bg-green-700" : "bg-[var(--button)] hover:bg-[var(--button-hover)]"}`}
                      onClick={() => {
                        navigator.clipboard.writeText(`${serverLink}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      disabled={true}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </>
                )}
              </div>
              {inviteCode && inviteCode.expiresAt && (
                <div className="text-sm text-gray-500 self-start">
                  Invite expires in:{" "}
                  {Math.floor(
                    (new Date(inviteCode.expiresAt).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24),
                  ).toLocaleString()}{" "}
                  days
                </div>
              )}
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
