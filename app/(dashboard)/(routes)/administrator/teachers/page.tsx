"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  Users,
  DollarSign,
  CheckCircle,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  publishedCourses: number;
}

const TeachersContent = () => {
  const { userId, isLoaded, getToken } = useAuth();

  const getTeachersData = async (): Promise<Teacher[]> => {
    const token = await getToken();
    const response = await fetch("/api/admin/teachers", {
      headers: {
        "x-user-id": userId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch teachers");
    }
    return response.json();
  };

  const {
    data: teachers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teachers"],
    queryFn: getTeachersData,
    enabled: !!userId,
  });

  useEffect(() => {
    if (isLoaded && !userId) {
      redirect("/");
    }
  }, [isLoaded, userId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <h1 className="text-3xl font-bold mb-6">Teacher Overview</h1>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SkeletonLoading key="loading" />
        ) : error ? (
          <ErrorMessage key="error" message={(error as Error).message} />
        ) : (
          <TeacherGrid key="grid" teachers={teachers || []} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SkeletonLoading = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    {[...Array(6)].map((_, index) => (
      <Card key={index} className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-1 flex-1">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
      </Card>
    ))}
  </motion.div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="text-center text-red-500 p-4"
  >
    Error: {message}
  </motion.div>
);

const TeacherGrid = ({ teachers }: { teachers: Teacher[] }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    }}
    initial="hidden"
    animate="show"
    exit={{ opacity: 0, transition: { duration: 0.2 } }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    {teachers.map((teacher) => (
      <TeacherCard key={teacher.id} teacher={teacher} />
    ))}
  </motion.div>
);

const TeacherCard = ({ teacher }: { teacher: Teacher }) => (
  <motion.div
    variants={{
      hidden: { y: 20, opacity: 0 },
      show: { y: 0, opacity: 1 },
    }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-blue-500 text-white text-xl">
            {teacher.firstName?.[0]}
            {teacher.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">
            {teacher.firstName} {teacher.lastName}
          </h2>
          <p className="text-sm text-gray-500">{teacher.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Stat
          icon={Users}
          label="Total Students"
          value={teacher.totalStudents}
        />
        <Stat
          icon={BookOpen}
          label="Total Courses"
          value={teacher.totalCourses}
        />
        <Stat
          icon={DollarSign}
          label="Total Revenue"
          value={`$${teacher.totalRevenue.toFixed(2)}`}
        />
        <Stat
          icon={CheckCircle}
          label="Published Courses"
          value={teacher.publishedCourses}
        />
      </div>
      <Link
        href={`/administrator/teachers/${teacher.id}`}
        className="text-blue-500 hover:text-blue-700 flex items-center justify-end group"
      >
        View Details
        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </Card>
  </motion.div>
);

const Stat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) => (
  <div className="flex items-center space-x-2">
    <Icon className="h-5 w-5 text-gray-400" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
);

const Teachers = () => (
  <QueryClientProvider client={queryClient}>
    <TeachersContent />
  </QueryClientProvider>
);

export default Teachers;
