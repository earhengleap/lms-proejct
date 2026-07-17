"use client";

import { Category, Course, Publisher, Chapter } from "@prisma/client";
import { CircleCheck, Clock } from "lucide-react";
import { InfoCard } from "./info-card";
import CoursesList from "@/components/courses-list";
import { motion } from "framer-motion";

type CourseData = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  publisher: Publisher | null;
  publisherName: string;
};

interface DashboardClientProps {
  userId: string;
  coursesInProgress: CourseData[];
  completedCourses: CourseData[];
}

const DashboardClient = ({
  userId,
  coursesInProgress,
  completedCourses,
}: DashboardClientProps) => {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Learning
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your progress and continue learning
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={coursesInProgress.length}
        />
        <InfoCard
          icon={CircleCheck}
          label="Completed"
          numberOfItems={completedCourses.length}
          variant="success"
        />
      </div>

      {coursesInProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CoursesList
            title="In Progress"
            items={coursesInProgress}
            userId={userId}
          />
        </motion.div>
      )}

      {completedCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <CoursesList
            title="Completed"
            items={completedCourses}
            userId={userId}
          />
        </motion.div>
      )}

      {coursesInProgress.length === 0 && completedCourses.length === 0 && (
        <CoursesList items={[]} userId={userId} />
      )}
    </div>
  );
};

export default DashboardClient;
