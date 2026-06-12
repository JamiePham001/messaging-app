"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { SignOut } from "../components/auth/sign-out-btn";
import { Header } from "@/components/layout/header";

export default function Home() {
  const { data: session } = useSession();

  useEffect(() => {
    console.log(session);
  }, [session]);

  return (
    <div>
      <Header></Header>
      <main className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] gap-4">
        <div className="text-[1.5rem]">Landing Page</div>
        <div className="italic">
          For demo accounts, my{" "}
          <a
            href="https://github.com/JamiePham001/messaging-app"
            target="_blank"
            className="underline"
          >
            GitHub
          </a>{" "}
          project page contains credentials for testing.
        </div>
        {session?.user && (
          <div>
            <SignOut />
          </div>
        )}
      </main>
    </div>
  );
}
