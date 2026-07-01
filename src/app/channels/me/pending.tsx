import { useState, useEffect } from "react";
import ProfilePicture from "@/src/components/layout/app/profilePicture";
import { getCached, setCache, invalidateCache } from "@/lib/utils/cache";

interface IFriendRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  acceptedAt: string | null;
  createdAt: string;
  status: string;
}

interface IBaseUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: string;
  status: string;
  sentRequests: IFriendRequest[];
  receivedRequests: IFriendRequest[];
}

interface PageParams {
  userId?: string;
}

const REQUESTS_CACHE_KEY = "friend-requests";

export default function Pending({ userId }: PageParams) {
  const cachedData = getCached<{ received: IBaseUser[]; sent: IBaseUser[] }>(REQUESTS_CACHE_KEY);

  const [receivedRequests, setReceivedRequests] = useState<IBaseUser[]>(cachedData?.received ?? []);
  const [sentRequests, setSentRequests] = useState<IBaseUser[]>(cachedData?.sent ?? []);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/friends/get/requests?userId=${userId}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReceivedRequests(data.friendRequests);
        }
      })
      .catch((error) => {
        console.error("Error fetching received friend requests:", error);
      });

    // fetch sent friend requests
    fetch(`/api/friends/get/sent?userId=${userId}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSentRequests(data.friendRequests);
        }
      })
      .catch((error) => {
        console.error("Error fetching sent friend requests:", error);
      });

    // Cache the results once both fetches complete
    Promise.all([
      fetch(`/api/friends/get/requests?userId=${userId}`).then(r => r.json()),
      fetch(`/api/friends/get/sent?userId=${userId}`).then(r => r.json()),
    ]).then(([receivedRes, sentRes]) => {
      if (receivedRes.success && sentRes.success) {
        setCache(REQUESTS_CACHE_KEY, {
          received: receivedRes.friendRequests,
          sent: sentRes.friendRequests,
        });
      }
    }).catch(() => {});
  }, [userId]);

  const acceptRequest = (requestId: string) => {
    fetch("/api/friends/update/acceptRequest", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReceivedRequests((prev) =>
            prev.filter((req) => req.sentRequests[0].id !== requestId),
          );
          invalidateCache([REQUESTS_CACHE_KEY]);
        }
      })
      .catch((error) => {
        console.error("Error accepting friend request:", error);
      });
  };

  const rejectRequest = (requestId: string) => {
    fetch("/api/friends/update/rejectRequest", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSentRequests((prev) =>
            prev.filter((req) => req.receivedRequests[0].id !== requestId),
          );
          invalidateCache([REQUESTS_CACHE_KEY]);
        }
      })
      .catch((error) => {
        console.error("Error rejecting friend request:", error);
      });
  };

  return (
    <div className="w-full h-full flex flex-col p-[2rem] pt-[1rem] gap-[1rem]">
      {receivedRequests.length === 0 ? (
        <div></div>
      ) : (
        <>
          <div>Received - {receivedRequests.length}</div>
          <div className="flex flex-col items-center w-full">
            {receivedRequests.map((request) => {
              return (
                <div key={request.id} className=" w-full ">
                  <hr className="border-none h-[1px] bg-[DimGray] w-full self-center" />
                  <div className="group flex justify-between items-center p-[0.5rem] rounded-[0.5rem] cursor-pointer hover:bg-[var(--test)]">
                    <div>
                      <div className="flex items-center gap-[1rem]">
                        <ProfilePicture username={request.displayName} />
                        <div className="flex flex-col">
                          <p>{request.displayName}</p>
                          <p>{request.username}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-[0.5rem]">
                      <button
                        className="flex items-center justify-center w-[2rem] h-[2rem] text-[1.5rem] cursor-pointer rounded-[2rem] text-white group-hover:bg-[var(--background)] hover:text-[MediumSeaGreen]"
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptRequest(request.sentRequests[0].id);
                        }}
                      >
                        +
                      </button>
                      <button
                        className="flex items-center justify-center w-[2rem] h-[2rem] text-[1.5rem] cursor-pointer rounded-[2rem] text-white group-hover:bg-[var(--background)] hover:text-[PaleVioletRed]"
                        onClick={(e) => {
                          e.stopPropagation();
                          rejectRequest(request.sentRequests[0].id);
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {sentRequests.length === 0 ? (
        <div></div>
      ) : (
        <>
          <div>Sent - {sentRequests.length}</div>
          <div className="flex flex-col items-center w-full">
            {sentRequests.map((request) => {
              return (
                <div key={request.id} className=" w-full ">
                  <hr className="border-none h-[1px] bg-[DimGray] w-full self-center" />
                  <div className="group flex justify-between items-center p-[0.5rem] rounded-[0.5rem] cursor-pointer hover:bg-[var(--test)]">
                    <div>
                      <div className="flex items-center gap-[1rem]">
                        <ProfilePicture username={request.displayName} />
                        <div className="flex flex-col">
                          <p>{request.displayName}</p>
                          <p className="text-[gray] text-[0.8rem]">
                            {request.username}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          rejectRequest(request.receivedRequests[0].id);
                        }}
                        className="flex items-center justify-center w-[2rem] h-[2rem] text-[1.5rem] cursor-pointer rounded-[2rem] text-white group-hover:bg-[var(--background)] hover:text-[PaleVioletRed]"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {receivedRequests.length === 0 && sentRequests.length === 0 && (
        <div className="flex flex-col items-center gap-[1rem] mt-[2rem]">
          <p className="text-[gray]">No pending friend requests</p>
        </div>
      )}
    </div>
  );
}
