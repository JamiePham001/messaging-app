import { useState } from "react";
import { IServer } from "@/types/index";
import router from "next/router";

interface ModalProps {
  close: () => void;
  serverId: string;
  isOwner: boolean;
  serverName?: string;
}

export default function DeleteServer({
  close,
  serverId,
  isOwner,
  serverName,
}: ModalProps) {
  const [inputValue, setInputValue] = useState("");

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    close();
  };

  const onDeleteServer = async () => {
    try {
      const res = await fetch(
        `/api/server/delete?serverId=${serverId}&isOwner=${isOwner}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error deleting server:", errorData.message);
        return;
      }
      const data = await res.json();
      if (data.success) {
        close();
        router.push(`/channels/me?deletedServer=${serverId}`); // Redirect to the homepage or another appropriate page
      } else {
        console.error("Error deleting server:", data.message);
      }
    } catch (error) {
      console.error("Error deleting server:", error);
    }
  };

  return (
    <div className="w-full h-full flex ">
      <div className="w-full h-full flex flex-col gap-[1rem]">
        <h1 className="text-[1.2rem] font-bold">{`Delete '${serverName}'`}</h1>
        <p className="text-[var(--subtitle)]">{`Are you sure you want to delete ${serverName}? This action cannot be undone.`}</p>

        <label htmlFor="serverName">Enter server name</label>
        <input
          id="serverName"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-[var(--inputs)] border border-[dimgray] focus:outline-none focus:ring-2 rounded px-[0.5rem] py-[0.25rem] disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex justify-between gap-[0.5rem]">
          <button
            className="bg-[var(--hover)] cursor-pointer text-white px-[1rem] py-[0.5rem] rounded hover:bg-[var(--test)]"
            onClick={() => setInputValue("")}
          >
            Cancel
          </button>
          <button
            onClick={onDeleteServer}
            disabled={inputValue !== serverName}
            className="bg-[red] cursor-pointer text-white px-[1rem] py-[0.5rem] rounded hover:bg-[rgb(255,0,0,0.5)] disabled:cursor-not-allowed disabled:bg-[rgb(255,0,0,0.5)] "
          >
            Delete Server
          </button>
        </div>
      </div>
      <div className="w-[10rem] flex justify-center">
        <button
          className="w-[3rem] h-[3rem] cursor-pointer rounded-full [border:2px_solid_dimgray] p-[0.5rem] flex items-center justify-center hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleCloseClick}
        >
          X
        </button>
      </div>
    </div>
  );
}
