"use client";

import { useState } from "react";
import { IconBadge } from "@/components/icon-badge";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import Link from "next/link";
import ChapterTitleForm from "./chapter-title-form";
import ChapterDescriptionForm from "./chapter-description-form";
import ChapterAccessForm from "./chapter-access-form";
import ChapterVideoForm from "./chapter-video-form";
import { ChapterActions } from "./chapter-actions";
import QuizzUploadDocument from "@/app/(course)/courses/[courseId]/chapters/[chapterId]/quizz/_components/quizz-upload-document";

interface ChapterIdClientProps {
  chapter: any;
  courseId: string;
  chapterId: string;
  isComplete: boolean;
  completionText: string;
  initialPendingStatus: boolean;
}

export const ChapterIdClient = ({
  chapter,
  courseId,
  chapterId,
  isComplete,
  completionText,
  initialPendingStatus,
}: ChapterIdClientProps) => {
  const [isPending, setIsPending] = useState(initialPendingStatus);

  const handlePendingChange = (newPendingStatus: boolean) => {
    setIsPending(newPendingStatus);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <Link
            href={`/teacher/courses/${courseId}`}
            className="flex items-center text-sm hover:opacity-75 transition mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course setup
          </Link>
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl font-medium">Chapter Creation</h1>
              <span className="text-sm text-slate-700">
                Complete all fields {completionText}
              </span>
            </div>
            <ChapterActions
              disabled={!isComplete}
              courseId={courseId}
              chapterId={chapterId}
              isPublished={chapter.isPublished}
              initialPendingStatus={isPending}
              onPendingChange={handlePendingChange}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your chapter</h2>
            </div>
            <ChapterTitleForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
            <ChapterDescriptionForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
            <QuizzUploadDocument
              initialData={chapter.quizzes[0] || null}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Eye} />
              <h2 className="text-xl">Access Settings</h2>
            </div>
            <ChapterAccessForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={Video} />
            <h2 className="text-2xl">Add a video</h2>
          </div>
          <ChapterVideoForm
            initialData={chapter}
            chapterId={chapterId}
            courseId={courseId}
          />
        </div>
      </div>
    </div>
  );
};
