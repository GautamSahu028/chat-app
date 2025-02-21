"use client";
import { chatHrefConstructor, hrefConstructor, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";
import toast, { Toast } from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage {
  data: Message;
  senderImg: string;
  senderName: string;
  success: boolean;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathName = usePathname();
  const [unseenMsgs, setUnseenMsgs] = useState<Message[]>([]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const newFriendHandler = () => {
      router.refresh();
    };
    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathName !==
        `/dashboard/chat/${chatHrefConstructor(
          sessionId,
          message.data.senderId
        )}`;
      if (!shouldNotify) return;
      toast.custom(
        (t: Toast) => (
          console.log("message : ", message.data.senderId),
          (
            <UnseenChatToast
              t={t}
              sessionId={sessionId}
              senderId={message.data.senderId}
              senderImg={message.senderImg}
              senderMessage={message.data.text}
              senderName={message.senderName}
            />
          )
        )
      );
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
    };
  }, [pathName, sessionId, router]);

  useEffect(() => {
    if (pathName?.includes("chat")) {
      setUnseenMsgs((prev) => {
        return prev.filter((msg) => !pathName.includes(msg.senderId));
      });
    }
  }, [pathName]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((friend) => {
          const unseenMsgsCount = unseenMsgs.filter(
            (unseenMsg) => unseenMsg.senderId === friend.id
          ).length;
          return (
            <li
              key={friend.id}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md gap-x-4 pl-2 text-sm leading-6 font-semibold hover:cursor-pointer"
            >
              <div className="relative h-8 w-8 bg-gray-50">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                  src={friend.image || ""}
                  alt="Profile pic"
                />
              </div>
              <a
                href={`/dashboard/chat/${hrefConstructor(
                  sessionId,
                  friend.id
                )}`}
              >
                {friend.name}
                {unseenMsgsCount > 0 ? (
                  <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                    {unseenMsgsCount}
                  </div>
                ) : null}
              </a>
            </li>
          );
        })}
    </ul>
  );
};

export default SidebarChatList;
