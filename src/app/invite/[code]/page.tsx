"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Invite } from "@/src/types";
import { LoadingCursor } from "@/lib/utiils/cursor/loading";

export default function ServerInvitePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const params = useParams();
  const inviteCode = params?.code;

  const [invite, setInvite] = useState<Invite | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  LoadingCursor(loading);

  useEffect(() => {
    if (!inviteCode) return;

    const checkUserMembership = async (serverId: string) => {
      try {
        const res = await fetch(
          `/api/server/get/check-membership?userId=${session?.user?.id}&serverId=${serverId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          // 404 means user is not a member — this is expected for invite flow
          if (res.status === 404) {
            return router.push(`/channels/me`);
          }
          console.error("Failed to check user membership:", res.status);
          return;
        }
        const data = await res.json();
        if (!data.success) {
          console.error("Error checking user membership:", data.message);
          return;
        }

        // redirect to server if user is already a member
        router.push(`/channels/${serverId}`);
        setLoading(false);
      } catch (error) {
        console.error("Error checking user membership:", error);
      }
    };

    const fetchInvite = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/server/invite/get/code?code=${inviteCode}`,
        );
        if (!res.ok) {
          console.error("Failed to fetch invite");
          return;
        }
        const data = await res.json();

        if (!data.success) {
          console.error("Error fetching invite:", data.message);
        }

        if (data.message === "Invite has expired") {
          console.error("Invite has expired");
          setExpired(true);
          return;
        }

        setInvite(data.invite);
        if (session?.user?.id) {
          await checkUserMembership(data.invite.serverId);
        }
      } catch (error) {
        console.error("Error fetching invite:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [inviteCode, router, session?.user.id]);

  useEffect(() => {
    if (session === null) {
      router.push("/login");
    }
  }, [session, router]);

  useEffect(() => {
    if (session && invite !== null && !invite?.server) {
      router.push("/channels/me");
    }
  }, [session, invite, router]);

  const createServerConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/server/update/user-list?serverId=${invite?.serverId}&userId=${session?.user?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        console.error("Failed to add user to server:", res.status);
        alert("Failed to join server.");
        return;
      }

      router.push(`/channels/${invite?.serverId}`);
    } catch (error) {
      console.error("Error joining server:", error);
      alert("Error joining server.");
    } finally {
      setLoading(false);
    }
  };

  if (!invite?.server) {
    return null;
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-[var(--background)]">
      <div className="w-[25rem] bg-[var(--primary)] rounded-[8px] p-[2rem] text-center bg-[var(--secondary)] flex flex-col gap-[1rem]">
        <h1 className="text-2xl font-bold mb-4">
          You have been invited to {invite?.server?.name} server!
        </h1>
        <div className="flex w-full self-center justify-between mt-[1rem] gap-[1rem]">
          <button
            className={`w-full py-[0.5rem] rounded bg-[var(--test)] cursor-pointer hover:bg-[var(--hover)]`}
            onClick={() => router.back()}
          >
            Back
          </button>
          <button
            className={`w-full py-[0.5rem] rounded bg-[var(--button)] cursor-pointer disabled:opacity-50 ${expired || loading ? "" : "hover:bg-[var(--button-hover)]"}`}
            disabled={expired || loading}
            onClick={createServerConnection}
          >
            {loading ? "Joining..." : "Join Server"}
          </button>
        </div>
        {expired && (
          <div className="text-[var(--subtitle)] text-[0.8rem]">
            Invite has expired.
          </div>
        )}
      </div>
    </div>
  );
}
