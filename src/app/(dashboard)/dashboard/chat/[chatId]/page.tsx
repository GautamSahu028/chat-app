import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";
import Image from "next/image";
import Messages from "@/components/Messages";
import ChatInput from "@/components/ChatInput";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}`,
      0,
      -1
    );
    const dbMessages = results.map((msg) => JSON.parse(msg) as Message);
    // console.log("results : ", results);
    const revDbMessages = dbMessages.reverse();
    const messages = messageArrayValidator.safeParse(revDbMessages);
    return messages;
  } catch (error) {
    notFound();
  }
}

const page: FC<PageProps> = async ({ params }) => {
  const { chatId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const { user } = session;

  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;

  const chatPartnerRaw = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw) as User;
  const initialMessages = await getChatMessages(chatId);
  // console.log("chatID : ", chatId);
  // console.log("initial messages : ", initialMessages.data);
  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 p-2">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`${chatPartner.name} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>

            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
      </div>

      {initialMessages && initialMessages.success ? (
        <Messages
          chatId={chatId}
          initialMessages={initialMessages.data}
          sessionId={session.user.id}
          chatPartner={chatPartner}
          sessionImg={session.user.image}
        />
      ) : (
        notFound()
      )}

      <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </div>
  );
};

export default page;
