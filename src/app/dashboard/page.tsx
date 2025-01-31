import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import React from "react";

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return <p>No active session</p>;
  }

  return <pre>{JSON.stringify(session)}</pre>;
};

export default Page;
