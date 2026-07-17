// app/(dashboard)/(routes)/teacher/courses/[courseId]/chapters/[chapterId]/page.tsx

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Eye,
  LayoutDashboard,
  Video,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ChapterTitleForm from "./_components/chapter-title-form";
import ChapterDescriptionForm from "./_components/chapter-description-form";
import ChapterAccessForm from "./_components/chapter-access-form";
import ChapterVideoForm from "./_components/chapter-video-form";
import { Banner } from "@/components/banner";
import { ChapterActions } from "./_components/chapter-actions";
import { QuizTabs } from "./_components/quiz-tab";

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // Fetch chapter with all related data
  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      quizzes: {
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      },
    },
  });

  if (!chapter) {
    return redirect("/");
  }

  // Check for pending deletion request
  const deletionRequest = await db.deletionRequest.findFirst({
    where: {
      itemId: params.chapterId,
      type: "chapter",
      status: "pending",
    },
  });

  const initialPendingStatus = Boolean(deletionRequest);

  // Check for required fields
  const requireFields = [
    chapter.title,
    chapter.description,
    chapter.videoUrl,
    chapter.quizzes.length > 0,
  ];

  const totalFields = requireFields.length;
  const completedFields = requireFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requireFields.every(Boolean);
  const progress = Math.round((completedFields / totalFields) * 100);

  // Separate quizzes by type for better organization
  const automaticQuiz = chapter.quizzes.find(
    (quiz) => quiz.type === "automatic"
  );
  const manualQuiz = chapter.quizzes.find((quiz) => quiz.type === "manual");

  const checklist = [
    { label: "Chapter title", done: !!chapter.title },
    { label: "Description", done: !!chapter.description },
    { label: "Video", done: !!chapter.videoUrl },
    { label: "Quiz", done: chapter.quizzes.length > 0 },
  ];

  return (
    <>
      {!chapter.isPublished && (
        <Banner
          variant="warning"
          label="This chapter is not published yet. It will not be visible in the course."
        />
      )}
      <div className="px-6 py-8 max-w-[1400px] mx-auto">
        <Link
          href={`/teacher/courses/${params.courseId}`}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to course setup
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Chapter setup
            </h1>
            <span className="text-sm text-slate-500">
              Complete all fields {completionText}
            </span>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-400">
                {progress}%
              </span>
            </div>
          </div>
          <ChapterActions
            disabled={!isComplete}
            courseId={params.courseId}
            chapterId={params.chapterId}
            isPublished={chapter.isPublished}
            initialPendingStatus={initialPendingStatus}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5">
              <div className="mb-4 flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} variant="slate" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Customize your chapter
                </h2>
              </div>
              <div className="space-y-4">
                <ChapterTitleForm
                  initialData={chapter}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                />
                <ChapterDescriptionForm
                  initialData={chapter}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                />
                <QuizTabs
                  automaticQuiz={automaticQuiz || null}
                  manualQuiz={manualQuiz || null}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/70 bg-white p-5">
              <div className="mb-4 flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-lg font-semibold text-slate-800">
                  Access settings
                </h2>
              </div>
              <ChapterAccessForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5">
              <div className="mb-4 flex items-center gap-x-2">
                <IconBadge icon={Video} variant="success" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Add a video
                </h2>
              </div>
              <ChapterVideoForm
                initialData={chapter}
                chapterId={params.chapterId}
                courseId={params.courseId}
              />
            </section>

            <section className="rounded-2xl border border-slate-200/70 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Completion checklist
              </h3>
              <ul className="space-y-3">
                {checklist.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                    <span
                      className={
                        item.done ? "text-slate-700" : "text-slate-400"
                      }
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
