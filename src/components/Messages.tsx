"use client";
import { cn, toPusherKey } from "@/lib/utils";
import React, { FC, useEffect, useRef, useState } from "react";
// import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
  chatId: string;
}
const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  chatId,
  chatPartner,
  sessionImg,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));
    const messageHandler = (message: Message) => {
      // console.log("Received message:", message);
      setMessages((prev) => [message, ...prev]);
    };
    pusherClient.bind("incoming-message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, [chatId]);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  // const formatTimeStamp = (timeStamp: number) => {
  //   return format(timeStamp, "HH:mm");
  // };

  return (
    <div
      id="msgs"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      {messages.map((msg, idx) => {
        const isCurrentUser = msg.senderId === sessionId;
        const hasNextMessageFromSameUser =
          messages[idx - 1]?.senderId === messages[idx].senderId;
        return (
          <div key={`${msg.id}-${msg.timeStamp}`}>
            <div
              className={cn("flex items-end", { "justify-end": isCurrentUser })}
            >
              <div
                className={cn(
                  `flex flex-col space-y-2 text-base max-w-xs mx-2`,
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-600": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {msg.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">{msg.time}</span>
                </span>
              </div>

              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt="Profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
