"use client";

import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface CourseData {
  title: string;
  completionRate: number;
}

interface CoursePerformanceProps {
  data: CourseData[];
}

export const CoursePerformance: React.FC<CoursePerformanceProps> = ({
  data,
}) => {
  const isEmpty = !data || data.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
          <BookOpen className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No course data yet</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Publish courses to see performance metrics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((course, index) => {
        const percent = course.completionRate * 100;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700 truncate max-w-[70%]">
                {course.title}
              </span>
              <span className="text-sm font-semibold text-sky-600">
                {percent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="bg-sky-500 h-full rounded-full"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
