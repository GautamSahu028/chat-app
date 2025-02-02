import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/validateFriend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const idToAdd = (await fetchRedis("get", `user:email:${email}`)) as string;
    if (!idToAdd) {
      return new Response("Person does not exist.", { status: 400 });
    }
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (idToAdd === session.user.id) {
      return new Response("Can't add yourself as friend", { status: 401 });
    }

    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as true | false;
    if (isAlreadyAdded) {
      return new Response("Already added this user", { status: 400 });
    }
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as true | false;
    if (isAlreadyFriends) {
      return new Response("Already friends with this user", { status: 400 });
    }

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("error : ", error);
      return new Response("Invalid Response Payload ", { status: 422 });
    }
    console.log("error : ", error);
    return new Response("Invalid request", { status: 400 });
  }
}
