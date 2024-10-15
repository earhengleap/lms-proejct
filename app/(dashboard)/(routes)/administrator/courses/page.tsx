"use client";

import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import { Book, Users, DollarSign, Image as ImageIcon } from "lucide-react";
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
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    transition={{ duration: 0.5 }}
    className="h-full"
  >
    <Card className="p-4 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:w-24 h-40 sm:h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
          {course.imageUrl ? (
            <>
              <Image
                src={course.imageUrl}
                alt={course.title}
                layout="fill"
                objectFit="cover"
                className="rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallbackIcon = target.parentNode?.querySelector(
                    ".fallback-icon"
                  ) as HTMLElement;
                  if (fallbackIcon) {
                    fallbackIcon.style.display = "block";
                  }
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
          <h3 className="text-lg font-semibold line-clamp-2">{course.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {course.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <span className="flex items-center text-sm text-gray-600">
              <Book className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                {course._count.chapters} chapters
              </span>
            </span>
            <span className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                {course._count.purchases} students
              </span>
            </span>
            <span className="flex items-center text-sm text-green-600">
              <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">${course.price}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <Badge variant={course.isPublished ? "default" : "secondary"}>
          {course.isPublished ? "Published" : "Draft"}
        </Badge>
        <span className="text-xs text-gray-500">
          {new Date(course.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Publisher: {course.publisher.name || "Unknown"}
      </div>
    </Card>
  </motion.div>
);

const CourseSkeleton = () => (
  <Card className="p-4 h-full flex flex-col">
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="relative w-full sm:w-24 h-40 sm:h-24 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex-1 w-full space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 bg-gray-200 rounded animate-pulse w-20"
            ></div>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-4 flex justify-between items-center">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
    </div>
    <div className="mt-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
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
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Course Management</h1>
      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <CourseSkeleton />
                </motion.div>
              ))
          ) : error ? (
            <div className="col-span-full text-center text-red-500">
              Error loading courses
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
