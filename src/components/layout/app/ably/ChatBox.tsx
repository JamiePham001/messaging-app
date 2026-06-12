import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import ProfilePicture from "@/src/components/layout/app/profilePicture";
import { useMessages, useTyping } from "@ably/chat/react";
import { ChatMessageEvent, Message, ChatMessageEventType } from "@ably/chat";
import { useParams } from "next/navigation";

interface IChannel {
  id: string;
  updatedAt: Date;
  visible: boolean;
  name?: string;
  messages: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    sender: ISender;
  }[];
}

interface IUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: string;
}

interface ISender {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: string;
}

interface IChatData extends IChannel {
  users: IUser[];
}

function parseUserClaim(userClaim?: string): { display_name?: string } {
  if (!userClaim) return {};
  try {
    return JSON.parse(userClaim) as { display_name?: string };
  } catch {
    return {};
  }
}

export default function ChatBox({
  chatData,
  channelId,
  isServer = false,
}: {
  chatData: IChatData | null;
  channelId: string;
  isServer?: boolean;
}) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [names, setNames] = useState<IUser[]>([]);

  const params = useParams<{
    serverId?: string;
  }>();
  const serverId = params?.serverId;

  // fetch display names of users in the server if it's a server chat, otherwise use the chatData users
  useEffect(() => {
    const fetchServerNames = async () => {
      if (!serverId) return;
      try {
        const res = await fetch(
          `/api/server/get/members?serverId=${serverId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setNames(data.members);
      } catch (error) {
        console.error("Error fetching server names:", error);
      }
    };

    if (isServer) {
      fetchServerNames();
    } else {
      if (chatData) {
        setNames(chatData.users);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, chatData?.id, isServer]);

  const { currentlyTyping, keystroke, stop } = useTyping();

  // The useMessages hook subscribes to messages in the room and provides a send method
  const { sendMessage, historyBeforeSubscribe, updateMessage } = useMessages({
    listener: (event: ChatMessageEvent) => {
      const message = event.message;
      switch (event.type) {
        case ChatMessageEventType.Created: {
          setMessages((prevMessages) => [message, ...prevMessages]);
          break;
        }
        default: {
          console.error("Unhandled event", event);
        }
      }
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage({ text: input.trim() }).catch((err) =>
      console.error("Error sending message", err),
    );
    setInput("");

    /* stop typing when the message is sent */
    stop().catch((err) => console.error("Error stopping typing", err));
  };

  /* add the following method to handle input changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (newValue.trim().length > 0) {
      // If the input value is not empty, start typing
      keystroke().catch((err) => console.error("Error starting typing", err));
    } else {
      // If the input is cleared, stop typing
      stop().catch((err) => console.error("Error stopping typing", err));
    }
  };

  //   Load message history when the component mounts
  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        if (!historyBeforeSubscribe) {
          // The room is not ready yet
          setLoading(false);
          return;
        }
        // Retrieve the last 10 messages
        const history = await historyBeforeSubscribe({ limit: 10 });
        // Set the messages in the state
        setMessages(history.items);
        setLoading(false);
      } catch (error) {
        console.error("Error loading message history:", error);
        setLoading(false);
      }
    }
    loadHistory();
  }, [historyBeforeSubscribe]);

  const onUpdateMessage = useCallback(
    (message: Message) => {
      const newText = prompt("Enter new text");
      if (!newText) {
        return;
      }
      updateMessage(message.serial, {
        text: newText,
        metadata: message.metadata,
        headers: message.headers,
      }).catch((error: unknown) => {
        console.warn("Failed to update message", error);
      });
    },
    [updateMessage],
  );

  function formatDate(date: Date) {
    const d = date;

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 → 12

    const hh = String(hours).padStart(2, "0");

    return `${day}/${month}/${year} ${hh}:${minutes} ${ampm}`;
  }
  return (
    <>
      {channelId ? (
        <main className="flex flex-col h-full w-full [border-left:1px_solid_DimGray] bg-[var(--secondary)]">
          <header className="h-[3rem] w-full border-b-[1px] border-b-[DimGray] flex items-center pl-[1rem] gap-[0.5rem]">
            {isServer ? (
              <div className="font-bold">{chatData?.name}</div>
            ) : (
              <div className="font-bold">
                {
                  chatData?.users.find((user) => user.id !== session?.user?.id)
                    ?.displayName
                }
              </div>
            )}
          </header>
          <section
            className={`flex flex-col justify-between h-full pb-[0.5rem] pl-[0.5rem] pr-[0.5rem] overflow-y-hidden ${isServer ? "[border-right:1px_solid_DimGray] " : ""}`}
          >
            {messages?.length === 0 ? (
              <>
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    Loading messages...
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    No messages yet. Say hi!
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col-reverse w-full h-full overflow-y-auto gap-[0.5rem] pb-[1rem]">
                {messages?.map((message, idx) => (
                  <div key={idx} className=" w-full ">
                    <div className="group flex justify-between items-center p-[0.5rem] rounded-[0.5rem] ">
                      <div>
                        <div className="flex items-center gap-[1rem]">
                          <ProfilePicture
                            username={
                              parseUserClaim(message.userClaim).display_name ||
                              ""
                            }
                            size={2.5}
                          />
                          <div className="flex flex-col">
                            <div className="flex gap-[0.5rem] items-center">
                              <div className="font-bold">
                                {parseUserClaim(message.userClaim).display_name}
                              </div>
                              <div className="text-[gray] text-[0.8rem]">
                                {formatDate(message.timestamp)}
                              </div>
                            </div>
                            <div
                              key={idx}
                              onClick={() => onUpdateMessage(message)}
                            >
                              <p>{message.text}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* typing indicator */}
            <div className="h-6 px-2 pt-2 absolute bottom-[4.5rem] transform translate-y-[-15%]">
              {currentlyTyping.size > 0 && (
                <p className="text-sm overflow-hidden font-bold text-[var(--subtitle)]">
                  {Array.from(currentlyTyping)
                    .map(
                      (userId) =>
                        names.find((user) => user.id === userId)?.displayName,
                    )
                    .join(", ")}{" "}
                  {currentlyTyping.size > 1 ? "are" : "is"} typing...
                </p>
              )}
            </div>
            <input
              type="text"
              placeholder="Message friend"
              className="w-full h-[4rem] p-[1rem] bg-[var(--test)]  rounded-[0.5rem]"
              value={input}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSend();
                }
              }}
            />
          </section>
        </main>
      ) : null}
    </>
  );
}
