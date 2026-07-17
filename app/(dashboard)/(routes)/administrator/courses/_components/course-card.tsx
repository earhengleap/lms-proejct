"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Book, Users, DollarSign, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeleteCourseButton } from "./delete-course-button";
import {
  formatCourseDate,
  formatCoursePrice,
  type Course,
} from "./types";

interface CourseCardProps {
  course: Course;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
};

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <div className="group h-full rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <div className="relative w-full sm:w-36 h-44 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                sizes="(max-width: 640px) 100vw, 144px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-slate-300" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight line-clamp-2">
                {course.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <Badge
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    course.isPublished
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
                <DeleteCourseButton course={course} />
              </div>
            </div>

            <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
              {course.description || "No description provided."}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
                <Book className="w-3.5 h-3.5 text-sky-500" />
                {course._count.chapters} chapters
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
                <Users className="w-3.5 h-3.5 text-violet-500" />
                {course._count.purchases} students
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                {formatCoursePrice(course.price)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Publisher:{" "}
            <span className="text-slate-700 font-medium">
              {course.publisher.name || "Unknown"}
            </span>
          </span>
          <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
            {formatCourseDate(course.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
