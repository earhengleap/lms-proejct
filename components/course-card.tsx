"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, User } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "./course-progress";
import { motion } from "framer-motion";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
  publisherName: string;
  isFromDashboard?: boolean;
  firstChapterId: string;
}

const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  publisherName,
  isFromDashboard = false,
  firstChapterId,
}: CourseCardProps) => {
  const courseUrl = isFromDashboard
    ? `/courses/${id}`
    : `/search/preview/courses/${id}/chapters/${firstChapterId}`;

  return (
    <Link href={courseUrl}>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
        className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden h-full hover:shadow-lg hover:shadow-slate-200/50 transition-shadow duration-300"
      >
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            alt={title}
            src={imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 space-y-3">
          <div>
            {category && (
              <span className="inline-block text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md mb-1.5">
                {category}
              </span>
            )}
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-sky-700 transition-colors duration-200">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {chaptersLength} {chaptersLength === 1 ? "ch" : "chs"}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span className="truncate max-w-[100px]">{publisherName}</span>
            </span>
          </div>

          {progress !== null ? (
            <CourseProgress
              variant={progress === 100 ? "success" : "default"}
              size="sm"
              value={progress}
            />
          ) : (
            <div className="pt-1">
              <span className="text-base font-bold text-slate-900">
                {formatPrice(price)}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default CourseCard;
