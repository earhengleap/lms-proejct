"use client";

import { Category, Course, Publisher } from "@prisma/client";
import CourseCard from "./course-card";
import { motion } from "framer-motion";
import { ShoppingCart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

const CoursesList = ({ items, userId }: CoursesListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <CourseCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl!}
            chaptersLength={item.chapters.length}
            price={item.price!}
            progress={item.progress}
            category={item.category?.name!}
            publisherName={item.publisher?.name ?? "Unknown Publisher"}
            isFromDashboard={!!userId}
            firstChapterId={item.chapters[0]?.id || ""}
          />
        ))}
      </div>
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center py-16 px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-8 mb-8"
          >
            <ShoppingCart className="w-16 h-16 text-blue-500" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold mb-4 text-gray-800"
          >
            Your Course Library is Empty
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 mb-8 max-w-md text-lg"
          >
            You haven&apos;t purchased any courses yet. Start your learning
            journey by exploring our wide range of courses!
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <Link href="/search">
              <Button
                size="lg"
                className="font-semibold bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Courses
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CoursesList;
