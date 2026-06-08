"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HeaderName() {
  const params = useParams<{ serverId: string }>();
  const serverId = params?.serverId;
  const [serverName, setServerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerName = async () => {
      if (!serverId) return setServerName(null);

      try {
        const res = await fetch(`/api/server/get?serverId=${serverId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch server name:", res.status);
          return;
        }

        const data = await res.json();
        if (data.success) {
          setServerName(data.server.name);
        } else {
          console.error("Error fetching server name:", data.message);
        }
      } catch (error) {
        console.error("Error fetching server name:", error);
      }
    };
    fetchServerName();
  }, [serverId]);

  return (
    <>
      {serverName ? (
        <div className="">{serverName}</div>
      ) : (
        <div className="">Messaging App</div>
      )}
    </>
  );
}
