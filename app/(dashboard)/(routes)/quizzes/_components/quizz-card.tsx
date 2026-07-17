"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ClipboardList, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface QuizzCardProps {
  courseId: string;
  courseTitle: string;
  courseImageUrl: string;
  quizCount: number;
  averageScore: number;
  category: string;
}

const QuizzCard: React.FC<QuizzCardProps> = ({
  courseId,
  courseTitle,
  courseImageUrl,
  quizCount,
  averageScore,
  category,
}) => {
  return (
    <Link href={`/quizzes/submissions/courses/${courseId}`}>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
        className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-shadow duration-300"
      >
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={courseImageUrl}
            alt={courseTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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
              {courseTitle}
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ClipboardList className="h-3.5 w-3.5" />
              {quizCount} {quizCount === 1 ? "quiz" : "quizzes"}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              {averageScore.toFixed(0)}%
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default QuizzCard;
