// app/dashboard/(routes)/teacher/courses/[courseId]/client.tsx

"use client";

import { useEffect, useState } from "react";
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
  isPendingDeletion: boolean; // Add this new prop
}

export const CourseIdPageClient = ({
  course,
  categories,
  courseId,
  isPendingDeletion, // Add this new prop
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

  const completionText = `(${completedFields} / ${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished && (
        <Banner label="This course is not published. It will not be visible to the students." />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course setup</h1>
            <span className="text-sm text-muted-foreground">
              Complete all fields {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={courseId}
            isPublished={course.isPublished}
            initialPendingStatus={isPendingDeletion} // Pass the initial pending status
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your course</h2>
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
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Course chapter</h2>
              </div>
              <ChapterForm initialData={course} courseId={course.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Sell your course</h2>
              </div>
              <PriceForm initialData={course} courseId={course.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-xl">Resources & Attachements</h2>
              </div>
              <AttachementForm initialData={course} courseId={course.id} />
            </div>
          </div>
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
