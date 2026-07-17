import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/administrator";
import { db } from "@/lib/db";
import { MessageSquare } from "lucide-react";
import { MessageInbox } from "./_components/message-inbox";

const AdministratorMessagesPage = async () => {
  const { userId } = auth();

  if (!userId || !(await isAdministrator(userId))) {
    redirect("/");
  }

  const comments = await db.comment.findMany({
    take: 60,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
      chapter: {
        select: {
          title: true,
          course: { select: { title: true } },
        },
      },
      replies: {
        select: { id: true },
      },
    },
  });

  const messages = comments.map((c) => ({
    id: c.id,
    text: c.message,
    createdAt: c.createdAt,
    author: {
      name:
        [c.user.firstName, c.user.lastName].filter(Boolean).join(" ") ||
        c.user.email ||
        "Anonymous",
      email: c.user.email,
    },
    course: c.chapter.course.title,
    chapter: c.chapter.title,
    replyCount: c.replies.length,
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Messages
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          Student discussions and feedback across all courses.
        </p>
      </div>

      <MessageInbox messages={messages} />
    </div>
  );
};

export default AdministratorMessagesPage;
