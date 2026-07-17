// app/dashboard/(routes)/teacher/courses/[courseId]/client.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconBadge } from "@/components/icon-badge";
import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { Banner } from "@/components/banner";
import { Actions } from "./actions";
import TitleForm from "./title-form";
import DescriptionForm from "./description-form"
import ImageForm from "./image-form";
import CategoryForm from "./category-form";
import ChapterForm from "./chapter-form";
import PriceForm from "./price-form";
import AttachementForm from "./attachment-form";
import { NotificationModal } from "./notification-modal";

interface CourseIdPageClientProps {
  course: any;
  categories: any[];
  courseId: string;
  isPendingDeletion: boolean;
}

export const CourseIdPageClient = ({
  course,
  categories,
  courseId,
  isPendingDeletion,
}: CourseIdPageClientProps) => {
  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some((chapter: any) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionPct = Math.round((completedFields / totalFields) * 100);
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished && (
        <Banner label="This course is not published. It will not be visible to the students." />
      )}
      <div className="p-6 sm:p-8 max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex flex-col gap-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Course setup
            </h1>
            <span className="text-sm text-slate-500">
              Complete all fields ({completedFields} / {totalFields})
            </span>
            <div className="mt-2 w-full sm:w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-slate-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={courseId}
            isPublished={course.isPublished}
            initialPendingStatus={isPendingDeletion}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-x-2.5 pb-1">
              <IconBadge icon={LayoutDashboard} variant="default" size="lg" />
              <h2 className="text-base font-semibold text-slate-900">
                Customize your course
              </h2>
            </div>
            <TitleForm initialData={course} courseId={course.id} />
            <DescriptionForm initialData={course} courseId={course.id} />
            <ImageForm initialData={course} courseId={course.id} />
            <CategoryForm
              initialData={course}
              courseId={course.id}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </section>

          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6 space-y-6">
            <div className="flex items-center gap-x-2.5 pb-1">
              <IconBadge icon={ListChecks} variant="slate" size="lg" />
              <h2 className="text-base font-semibold text-slate-900">
                Course chapter
              </h2>
            </div>
            <ChapterForm initialData={course} courseId={course.id} />

            <div className="flex items-center gap-x-2.5 pt-2">
              <IconBadge icon={CircleDollarSign} variant="success" size="lg" />
              <h2 className="text-base font-semibold text-slate-900">
                Sell your course
              </h2>
            </div>
            <PriceForm initialData={course} courseId={course.id} />

            <div className="flex items-center gap-x-2.5 pt-2">
              <IconBadge icon={File} variant="warning" size="lg" />
              <h2 className="text-base font-semibold text-slate-900">
                Resources &amp; Attachments
              </h2>
            </div>
            <AttachementForm initialData={course} courseId={course.id} />
          </section>
        </div>
        <NotificationListener courseId={courseId} />
      </div>
    </>
  );
};

const NotificationListener = ({ courseId }: { courseId: string }) => {
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const checkNotification = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/notification`);
        const data = await response.json();
        if (data.message) {
          setNotification(data.message);
        }
      } catch (error) {
        console.error("Failed to fetch notification:", error);
      }
    };

    const intervalId = setInterval(checkNotification, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [courseId]);

  return (
    <NotificationModal
      isOpen={!!notification}
      onClose={() => setNotification(null)}
      message={notification || ""}
    />
  );
};
