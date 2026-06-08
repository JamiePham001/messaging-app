import { useState } from "react";

export default function AddFriend({ userId }: { userId: string }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onsubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const receiverId: { success: boolean; userId?: string } = await fetch(
      `/api/user/get/userId/${username}`,
    ).then((res) => res.json());

    if (!receiverId.success) {
      setError("User not found");
      return;
    }

    const friendRequest = await fetch("/api/friends/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ senderId: userId, receiverId: receiverId.userId }),
    });

    if (!friendRequest.ok) {
      setSuccess("");
      const data = await friendRequest.json();
      if (data.message === "Friend request already exists") {
        setError(data.message || "Failed to send friend request");
      } else {
        setError("Failed to send friend request");
      }
      return;
    }

    if (friendRequest.ok) {
      setError("");
      setSuccess("Friend request sent");
      setUsername("");
    }
  };
  return (
    <div className="w-full h-full flex flex-col p-[2rem] gap-[1rem]">
      <h2 className="text-2xl font-bold">Add Friend</h2>
      <p>Add friends with their username</p>
      <form className="flex gap-[0.5rem] w-[95%]" onSubmit={onsubmit}>
        <input
          type="text"
          placeholder="Enter friend's username"
          className="flex-1 p-[0.5rem] border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
            setSuccess("");
          }}
        />
        <button
          type="submit"
          disabled={!username.trim()}
          className="p-[0.5rem] bg-[var(--button)] text-white rounded font-bold cursor-pointer hover:bg-[var(--button-hover)] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Send Friend Request
        </button>
      </form>
      <p className="text-red-500">{error}</p>
      <p className="text-green-500">{success}</p>
    </div>
  );
}
