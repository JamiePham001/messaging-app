import React from "react";

export default function FriendsNavbar({
  array,
  setNavId,
  navId,
}: {
  array?: { id: string; label: string }[];
  setNavId: React.Dispatch<React.SetStateAction<string>>;
  navId?: string;
}) {
  return (
    <nav className="flex justify-start items-center gap-[1rem] h-[3rem] w-full border-b-[1px] border-[DimGray] px-[1rem]">
      <div>Friends &nbsp;</div>
      {array?.map((obj: { id: string; label: string }) =>
        obj.id === "addFriend" ? (
          <button
            key={obj.id}
            className="bg-[cornflowerblue] px-3 py-1 rounded-[8px] [transition:0.25s_ease-in-out] hover:bg-[#4a6eb1] cursor-pointer"
            onClick={() => setNavId(obj.id)}
          >
            {obj.label}
          </button>
        ) : (
          <button
            key={obj.id}
            className={`px-3 py-1 rounded-[8px] [transition:0.25s_ease-in-out] hover:bg-[#444444] cursor-pointer ${navId === obj.id ? "bg-[DimGray] hover:bg-[DimGray]" : "bg-[rgba(0,_0,_0,_0)]"}`}
            onClick={() => setNavId(obj.id)}
          >
            {obj.label}
          </button>
        ),
      )}
    </nav>
  );
}
