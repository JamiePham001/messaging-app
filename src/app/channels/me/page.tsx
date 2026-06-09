"use client";

import FriendsNavbar from "@/src/components/layout/app/navBar";
import { useState, useEffect } from "react";
import Online from "./online";
import All from "./all";
import Pending from "./pending";
import AddFriend from "./addFriend";
import { useSession } from "next-auth/react";

interface IMenuItem {
  id: string;
  label: string;
}

interface IFriendsList {
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

interface UserChannel extends IFriendsList {
  channels: IChannel[];
}

const menuItems: IMenuItem[] = [
  { id: "online", label: "Online" },
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "addFriend", label: "Add Friend" },
];

export default function LoggedUser() {
  const [navId, setNavId] = useState<string>("online");
  const { data: sessionData, status } = useSession();
  const [friendsList, setFriendsList] = useState<UserChannel[]>([]);

  const userId = sessionData?.user?.id;

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/friends/get/${userId}`)
      .then((res) => res.json())
      .then((data) => setFriendsList(data.friends))
      .catch((error) => {
        console.error("Error fetching friends list:", error);
      });
  }, [userId]);

  useEffect(() => {
    console.log("Friends List Updated:", friendsList);
  }, [friendsList]);

  return (
    <main className="flex flex-col h-full w-full [border-top:1px_solid_DimGray] [border-left:1px_solid_DimGray] bg-[var(--secondary)]">
      <FriendsNavbar array={menuItems} setNavId={setNavId} navId={navId} />

      {navId === "online" && <Online data={friendsList} />}
      {navId === "all" && <All data={friendsList} />}
      {userId &&
        navId === "pending" &&
        (status === "loading" ? null : <Pending userId={userId} />)}
      {userId &&
        navId === "addFriend" &&
        (status === "loading" ? null : <AddFriend userId={userId} />)}
    </main>
  );
}
