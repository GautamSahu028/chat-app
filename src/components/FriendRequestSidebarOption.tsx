"use client";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";

interface FriendRequestSidebarOptionProps {
  initialUnseenRequestCount: number;
  sessionId: string;
}

const FriendRequestSidebarOption: FC<FriendRequestSidebarOptionProps> = ({
  initialUnseenRequestCount,
  sessionId,
}) => {
  const [unseenReqCount, setUnseenReqCount] = useState<number>(
    initialUnseenRequestCount
  );
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );
    const friendRequestHandler = () => {
      setUnseenReqCount((prev) => prev + 1);
    };
    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, []);
  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 h-6 w-6 shrink-0 flex items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Friend requests</p>

      {unseenReqCount > 0 ? (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
          {unseenReqCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequestSidebarOption;
