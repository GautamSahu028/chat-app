"use client";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FC, useState } from "react";

interface FriendRequestsProps {
  inComingFriendRequests: IncomingFriendRequests[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  inComingFriendRequests,
  sessionId,
}) => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<
    IncomingFriendRequests[]
  >(inComingFriendRequests);

  const acceptFriend = async (senderId: string) => {
    await axios.post("/api/friends/accept", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((req) => req.senderId !== senderId)
    );
    router.refresh();
  };
  const denyFriend = async (senderId: string) => {
    await axios.post("/api/friends/deny", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((req) => req.senderId !== senderId)
    );
    router.refresh();
  };
  return (
    <>
      {friendRequests.length === 0 ? (
        <p>No friend requests</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              onClick={() => acceptFriend(request.senderId)}
              aria-label="accept friend"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>
            <button
              onClick={() => denyFriend(request.senderId)}
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
            <button></button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
