"use client";
import { signOut } from "next-auth/react";

export function SignOut() {
  return (
    <button
      onClick={() => signOut()}
      style={{
        padding: ".5rem",
        backgroundColor: "white",
        cursor: "pointer",
        color: "black",
      }}
    >
      Sign Out
    </button>
  );
}
