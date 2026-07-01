import React from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import RolesPage from "./SettingsPages/Roles";
import DeleteServer from "./SettingsPages/DeleteServer";
import { IRoles, IServer } from "@/src/types";
import { getCached, setCache } from "@/lib/utils/cache";

const SERVER_CACHE_KEY = "server-detail";

interface ModalProps {
  onClose: () => void;
  serverId: string;
  sessionId: string;
  userRoles: IRoles[];
  //   setServers: React.Dispatch<React.SetStateAction<IServer[]>>;
}

function splitMenuIndex(num: number): [number, number] {
  if (!Number.isInteger(num) || num < 0) {
    return [0, 0];
  }

  const sectionIndex = Math.floor(num / 10);
  const buttonIndex = num % 10;

  return [sectionIndex, buttonIndex];
}

const ServerSettings = ({
  onClose,
  serverId,
  sessionId,
  userRoles,
}: ModalProps) => {
  const [detectChange, setDetectChange] = useState(false);
  const [serverData, setServerData] = useState<IServer | null>(null);
  const pageDetails = [
    {
      title: "PEOPLE",
      buttons: [
        {
          btnTitle: "Roles",
          page: ({
            serverId,
            sessionId,
          }: {
            serverId: string;
            sessionId: string;
            close: () => void;
            menuBtnsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
          }) => (
            <RolesPage
              serverId={serverId}
              sessionId={sessionId}
              close={onClose}
              menuBtnsDisabled={setDetectChange}
            />
          ),
        },
      ],
    },
    {
      title: "",
      buttons: [
        {
          btnTitle: "Delete Server",
          page: () => (
            <DeleteServer
              serverId={serverId}
              close={onClose}
              isOwner={userRoles.some((role) => role.role === "Owner")}
              serverName={serverData?.name}
            />
          ),
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const cacheKey = `${SERVER_CACHE_KEY}::${serverId}`;
        const cachedServer = getCached<IServer>(cacheKey);

        if (cachedServer) {
          setServerData(cachedServer);
          return;
        }

        const res = await fetch(`/api/server/get?serverId=${serverId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error fetching server data:", errorData.message);
          return;
        }
        const data = await res.json();
        if (data.success) {
          setServerData(data.server);
          setCache(cacheKey, data.server);
        } else {
          console.error("Error fetching server data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching server data:", error);
      }
    };

    fetchServerData();
  }, [serverId]);

  // modal states
  const [menuIndex, setMenuIndex] = useState(0);

  const [sectionIndex, buttonIndex] = splitMenuIndex(menuIndex);
  const activePage =
    pageDetails[sectionIndex]?.buttons?.[buttonIndex]?.page ?? (() => null);

  const modalContent = (
    <motion.div
      className="fixed inset-0 z-[1000] flex h-screen w-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.33, ease: "easeIn" }}
    >
      <section className="h-full w-[30%] bg-[var(--background)] flex justify-end pt-[5rem] ">
        <div className="w-[17rem] flex flex-col pr-[0.5rem] gap-[0.5rem]">
          {pageDetails.map((page, index) => (
            <div className="flex flex-col" key={index}>
              <h2 className="text-[0.7rem] font-bold text-[var(--subtitle)] px-[0.5rem]">
                {page.title}
              </h2>
              <div id="people-section" className="flex flex-col">
                {page.buttons.map((btn, btnIndex) => (
                  <React.Fragment key={btnIndex}>
                    <div className="">
                      {btn.btnTitle === "Delete Server" &&
                      userRoles.some((role) => role.role === "Owner") ? (
                        <button
                          key={btnIndex}
                          className={`cursor-pointer w-full hover:bg-[var(--hover)] py-[0.25rem] px-[0.5rem] rounded text-left text-[salmon] ${menuIndex === Number(`${index}${btnIndex}`) ? "bg-[var(--test)] hover:bg-[var(--test)]" : ""}`}
                          onClick={() => {
                            setMenuIndex(Number(`${index}${btnIndex}`));
                            setDetectChange(false);
                          }}
                        >
                          {btn.btnTitle}
                        </button>
                      ) : (
                        <button
                          key={btnIndex}
                          className={`cursor-pointer w-full hover:bg-[var(--hover)] py-[0.25rem] px-[0.5rem] rounded text-left disabled:opacity-50 disabled:cursor-not-allowed ${menuIndex === Number(`${index}${btnIndex}`) ? "bg-[var(--test)] hover:bg-[var(--test)]" : ""}`}
                          onClick={() =>
                            setMenuIndex(Number(`${index}${btnIndex}`))
                          }
                          disabled={detectChange}
                        >
                          {btn.btnTitle}
                        </button>
                      )}
                    </div>
                    {btn.btnTitle !== "Delete Server" && (
                      <hr className="h-[1px] text-[dimgray]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="h-full w-full bg-[var(--secondary)] flex justify-between pt-[5rem] pl-[3rem]">
        <div className="max-w-[50rem]">
          {activePage({
            serverId,
            sessionId,
            close: onClose,
            menuBtnsDisabled: setDetectChange,
          })}
        </div>
      </section>
    </motion.div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ServerSettings;
