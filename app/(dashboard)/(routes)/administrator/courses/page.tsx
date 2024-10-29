"use client";

import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import {
  Book,
  Users,
  DollarSign,
  Image as ImageIcon,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const queryClient = new QueryClient();

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  isPublished: boolean;
  createdAt: string;
  publisher: {
    name: string | null;
  };
  _count: {
    chapters: number;
    purchases: number;
  };
}

const fetchCourses = async (): Promise<Course[]> => {
  const response = await axios.get("/api/admin/courses");
  return response.data;
};

const CourseCard = ({ course }: { course: Course }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="h-full"
    whileHover={{ scale: 1.02 }}
  >
    <Card className="p-6 h-full flex flex-col bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group">
          {course.imageUrl ? (
            <>
              <Image
                src={course.imageUrl}
                alt={course.title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallbackIcon = target.parentNode?.querySelector(
                    ".fallback-icon"
                  ) as HTMLElement;
                  if (fallbackIcon) fallbackIcon.style.display = "block";
                }}
              />
              <ImageIcon
                className="w-12 h-12 text-gray-400 fallback-icon absolute"
                style={{ display: "none" }}
              />
            </>
          ) : (
            <ImageIcon className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
              {course.title}
            </h3>
            <Badge
              variant={course.isPublished ? "default" : "secondary"}
              className={`ml-2 ${course.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {course.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">
            {course.description}
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1">
              <Book className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {course._count.chapters} chapters
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {course._count.purchases} students
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                ${course.price}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Publisher: {course.publisher.name || "Unknown"}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">
            {new Date(course.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  </motion.div>
);

const CourseSkeleton = () => (
  <Card className="p-6 h-full bg-white dark:bg-gray-800 border-0">
    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
      <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="flex-1 w-full space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  </Card>
);

const CoursesContent = () => {
  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: fetchCourses,
  });

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Course Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage and monitor your course catalog
        </p>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CourseSkeleton />
                </motion.div>
              ))
          ) : error ? (
            <div className="col-span-full flex items-center justify-center p-8 rounded-lg bg-red-50 dark:bg-red-900/20">
              <span className="text-red-600 dark:text-red-400">
                Error loading courses
              </span>
            </div>
          ) : (
            courses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

const Courses = () => (
  <QueryClientProvider client={queryClient}>
    <CoursesContent />
  </QueryClientProvider>
);

export default Courses;
