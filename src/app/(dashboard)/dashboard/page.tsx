import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import React from "react";
import LogoutButton from "@/components/LogoutButton";

const Page = async () => {
  return <div>Dashboard</div>;
};

export default Page;
