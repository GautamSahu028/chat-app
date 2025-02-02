import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import React from "react";
import LogoutButton from "@/components/LogoutButton";

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return <p>No active session</p>;
  }
  return <div>{session ? <LogoutButton /> : "Please sign in!"}</div>;
};

export default Page;
