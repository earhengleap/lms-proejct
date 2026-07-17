"use client";

import { Category, Course, Publisher } from "@prisma/client";
import CourseCard from "./course-card";
import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import Link from "next/link";

type CourseWithProgressWithCategoryAndPublisher = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  publisher: Publisher | null;
};

interface CoursesListProps {
  items: CourseWithProgressWithCategoryAndPublisher[];
  userId?: string;
  title?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const CoursesList = ({ items, userId, title }: CoursesListProps) => {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center text-center py-16"
      >
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <BookOpen className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1.5">
          No courses yet
        </h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6">
          Start your learning journey by exploring our wide range of courses!
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors duration-200"
        >
          <Search className="h-4 w-4" />
          Browse Courses
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <span className="text-sm text-slate-400">{items.length} courses</span>
        </div>
      )}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {items.map((course) => (
          <motion.div key={course.id} variants={item}>
            <CourseCard
              id={course.id}
              title={course.title}
              imageUrl={course.imageUrl!}
              chaptersLength={course.chapters.length}
              price={course.price!}
              progress={course.progress}
              category={course.category?.name!}
              publisherName={course.publisher?.name ?? "Unknown"}
              isFromDashboard={!!userId}
              firstChapterId={course.chapters[0]?.id || ""}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CoursesList;
