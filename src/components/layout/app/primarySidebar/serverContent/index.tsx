import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import CreateServerGroup from "@/src/components/modal/CreateServerGroup";
import CreateServerChannel from "@/src/components/modal/CreateServerChannel";
import type { IRoles, IServerGroup } from "@/src/types";
import { useSession } from "next-auth/react";
import ServerSettings from "@/src/components/modal/ServerSettings";
import ServerInvite from "@/src/components/modal/ServerInvite";
import { LoadingCursor } from "@/lib/utiils/cursor/loading";

// tool tip will render into document.body via a portal to avoid clipping issues
function CreateChannelButton({ action }: { action: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltip, setTooltip] = useState<{ top: number; left: number } | null>(
    null,
  );

  const showTooltip = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltip({ top: rect.bottom - 55, left: rect.left + rect.width / 2 });
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltip(null)}
        onClick={action}
        className="cursor-pointer font-bold hover:text-white px-[0.5rem]"
      >
        +
      </button>
      {tooltip &&
        createPortal(
          <span
            style={{
              position: "fixed",
              top: tooltip.top,
              left: tooltip.left,
              transform: "translateX(-50%)",
              zIndex: 999,
            }}
            className="pointer-events-none w-[130px] rounded-[6px] bg-[DimGray] py-[5px] text-center text-sm text-white"
          >
            Create Channel
          </span>,
          document.body,
        )}
    </>
  );
}

function ContextMenu({
  children,
  action,
  serverSettingsAction,
  serverInviteAction,
  userRoles,
}: {
  children: React.ReactNode;
  action: () => void;
  serverSettingsAction: () => void;
  serverInviteAction: () => void;
  userRoles: IRoles[];
}) {
  const [clicked, setClicked] = useState(false);
  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleClick = () => setClicked(false);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div
        className="flex flex-col h-full w-full p-[0.5rem] gap-[1rem] overflow-y-auto relative"
        onContextMenu={(e) => {
          e.preventDefault();
          setClicked(true);
          setPoints({
            x: e.pageX,
            y: e.pageY,
          });
          console.log("Right Click", e.pageX, e.pageY);
        }}
      >
        {children}
      </div>
      {clicked &&
        createPortal(
          <div
            style={{ top: points.y, left: points.x }}
            className="absolute bg-[var(--test)] border-[1px_solid_dimgray] z-[999] rounded p-[0.5rem]"
          >
            <ul className="flex flex-col gap-[0.25rem]">
              {userRoles.some((role) => role.admin) && (
                <li
                  className="cursor-pointer hover:bg-[var(--hover)] rounded w-full px-[0.5rem] py-[0.25rem]"
                  onClick={action}
                >
                  Create Category
                </li>
              )}

              {userRoles.some((role) => role.admin) && (
                <li
                  className="cursor-pointer hover:bg-[var(--hover)] rounded w-full px-[0.5rem] py-[0.25rem]"
                  onClick={serverSettingsAction}
                >
                  Server Settings
                </li>
              )}

              <li
                className="cursor-pointer hover:bg-[var(--hover)] rounded w-full px-[0.5rem] py-[0.25rem]"
                onClick={serverInviteAction}
              >
                Invite Friends
              </li>
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default function ServerContent() {
  const params = useParams<{ serverId: string; channelId: string }>();
  const serverId = params?.serverId;
  const channelId = params?.channelId;
  const router = useRouter();

  const [channelIndex, setChannelIndex] = useState(channelId || "");
  const [showModal, setShowModal] = useState(false);
  const [selectedSCGId, setSelectedSCGId] = useState("");

  // modals
  const [showServerInviteModal, setShowServerInviteModal] = useState(false);
  const [showServerChannelModal, setShowServerChannelModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // data
  const { data: session } = useSession();
  const [userRoles, setUserRoles] = useState<IRoles[]>([]);
  const [serverChannels, setServerChannels] = useState<IServerGroup[]>([]);
  const [loading, setLoading] = useState(false);
  LoadingCursor(loading);

  useEffect(() => {
    if (!serverId) return router.push("/channels/me");

    const fetchChannels = async (roles: IRoles[]) => {
      try {
        const response = await fetch(
          `/api/server/channelGroup/get?serverId=${serverId}&userRoles[]=${roles.map((role) => role.id).join("&userRoles[]=")}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setServerChannels(data.filteredGroups ?? []);
      } catch (error) {
        console.error("Failed to fetch server channels:", error);
      }
    };

    const fetchUserRoles = async () => {
      if (!session?.user?.id) return;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/server/roles/get/userId?serverId=${serverId}&userId=${session.user.id}`,
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
        const userRolesData = data.roles;
        fetchChannels(userRolesData);
        setUserRoles(userRolesData);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [serverId, router, session?.user?.id]);

  useEffect(() => {
    console.log("Updated server channels:", serverChannels);
  }, [serverChannels]);

  return (
    <div className="flex flex-col h-full w-full ">
      <header className="h-[3rem] font-bold w-full flex items-center px-[0.5rem] gap-[0.5rem] [border-bottom:1px_solid_DimGray]">
        {userRoles.some((role) => role.admin) ? (
          <div className="w-full flex justify-between items-center">
            <div
              className="px-[10px] py-[3px] rounded hover:bg-[var(--hover)] cursor-pointer"
              onClick={() => setShowSettingsModal(true)}
            >
              {serverChannels[0]?.server.name ?? ""}
            </div>
            <div
              className="p-[0.1rem] hover:bg-[var(--hover)] rounded cursor-pointer"
              onClick={() => setShowServerInviteModal(true)}
            >
              👥
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-between items-center">
            <div className="px-[10px] py-[3px] rounded ">
              {serverChannels[0]?.server.name ?? ""}
            </div>
            <div
              className="p-[0.1rem] hover:bg-[var(--hover)] rounded cursor-pointer"
              onClick={() => setShowServerInviteModal(true)}
            >
              👥
            </div>
          </div>
        )}
      </header>

      <div className="h-full w-full ">
        {serverChannels.length === 0 ? null : (
          <ContextMenu
            action={() => setShowModal(true)}
            serverSettingsAction={() => setShowSettingsModal(true)}
            serverInviteAction={() => setShowServerInviteModal(true)}
            userRoles={userRoles}
          >
            {serverChannels.map((group) => (
              <div key={group.id} className="flex flex-col">
                <div className="flex justify-between items-center text-[var(--subtitle)]">
                  <h2 className="flex gap-[0.5rem] items-center text-[0.9rem]">
                    <div className="">{group.name}</div>
                    <div className="rotate-[0.5turn] -translate-y-[15%] ">
                      ^
                    </div>
                  </h2>
                  <div
                    className="group relative flex flex-col items-center justify-center"
                    onContextMenu={(e) => e.stopPropagation()}
                  >
                    {userRoles.some((role) => role.admin) && (
                      <CreateChannelButton
                        action={() => {
                          setSelectedSCGId(group.id);
                          setShowServerChannelModal(true);
                        }}
                      />
                    )}
                  </div>
                </div>

                {group.channels === undefined ? null : (
                  <div className="">
                    {group?.channels.map((channel) => (
                      <Link
                        key={channel.id}
                        href={`/channels/${serverId}/${channel.id}`}
                        onClick={() => {
                          setChannelIndex(channel.id);
                        }}
                        onContextMenu={(e) => e.stopPropagation()}
                      >
                        <div
                          className={`w-full h-[2rem] pl-[0.5rem] flex gap-[0.5rem] flex items-center hover:bg-[var(--hover)] rounded ${channelIndex === channel.id ? "bg-[var(--test)] text-white hover:bg-[var(--test)]" : ""}`}
                        >
                          <div className="">#</div>
                          <div className="">{channel.name}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </ContextMenu>
        )}
      </div>

      {showServerChannelModal && serverId && selectedSCGId && (
        <CreateServerChannel
          serverId={serverId}
          SCGId={selectedSCGId}
          onClose={() => setShowServerChannelModal(false)}
          setServerChannels={setServerChannels}
        />
      )}

      {showModal && serverId && (
        <CreateServerGroup
          serverId={serverId}
          onClose={() => setShowModal(false)}
          setServerChannels={setServerChannels}
        />
      )}

      {showSettingsModal && serverId && session?.user?.id && (
        <ServerSettings
          onClose={() => setShowSettingsModal(false)}
          serverId={serverId}
          sessionId={session.user.id}
          userRoles={userRoles}
        />
      )}

      {showServerInviteModal && serverId && session?.user?.id && (
        <ServerInvite
          onClose={() => setShowServerInviteModal(false)}
          serverName={serverChannels[0]?.server.name}
          serverId={serverId}
        />
      )}
    </div>
  );
}
