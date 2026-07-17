"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpenCheck } from "lucide-react";
import { CourseList } from "./_components/course-list";
import { fetchCourses } from "./_components/api";

const queryClient = new QueryClient();

const CoursesContent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: fetchCourses,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 sm:p-8 space-y-8 max-w-[1400px] mx-auto"
    >
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <BookOpenCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Course Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and monitor your course catalog
          </p>
        </div>
      </header>

      <CourseList courses={data} isLoading={isLoading} error={error} />
    </motion.div>
  );
};

const Courses = () => (
  <QueryClientProvider client={queryClient}>
    <CoursesContent />
  </QueryClientProvider>
);

export default Courses;
