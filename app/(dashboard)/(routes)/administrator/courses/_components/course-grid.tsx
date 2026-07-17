"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CourseCard } from "./course-card";
import { EmptyState } from "./empty-state";
import type { Course } from "./types";

interface CourseGridProps {
  courses: Course[];
  emptyMessage: string;
}

export const CourseGrid = ({ courses, emptyMessage }: CourseGridProps) => {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5"
    >
      <AnimatePresence mode="popLayout">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
        {courses.length === 0 && (
          <EmptyState message={emptyMessage} key="empty" />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
