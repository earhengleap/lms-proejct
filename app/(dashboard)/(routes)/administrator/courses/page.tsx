"use client";

import {
  useQuery,
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import {
  Book,
  Users,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown } from "lucide-react";

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

// Add these type definitions and constants at the top of your file
type SortOption = {
  label: string;
  value: string;
  sortFn: (a: Course, b: Course) => number;
};

const SORT_OPTIONS: SortOption[] = [
  {
    label: "Newest First",
    value: "date-desc",
    sortFn: (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  },
  {
    label: "Oldest First",
    value: "date-asc",
    sortFn: (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  {
    label: "Price: High to Low",
    value: "price-desc",
    sortFn: (a, b) => b.price - a.price,
  },
  {
    label: "Price: Low to High",
    value: "price-asc",
    sortFn: (a, b) => a.price - b.price,
  },
  {
    label: "Most Students",
    value: "students-desc",
    sortFn: (a, b) => b._count.purchases - a._count.purchases,
  },
  {
    label: "Least Students",
    value: "students-asc",
    sortFn: (a, b) => a._count.purchases - b._count.purchases,
  },
];

// Add these new components
const SearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder="Search courses..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

const SortButton = ({
  currentSort,
  onSortChange,
}: {
  currentSort: string;
  onSortChange: (value: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="ml-2">
        <ArrowUpDown className="w-4 h-4 mr-2" />
        {SORT_OPTIONS.find((option) => option.value === currentSort)?.label ||
          "Sort by"}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      {SORT_OPTIONS.map((option) => (
        <DropdownMenuItem
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={currentSort === option.value ? "bg-accent" : ""}
        >
          {option.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const fetchCourses = async (): Promise<Course[]> => {
  try {
    const response = await axios.get("/api/admin/courses");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch courses. Please try again later.");
  }
};

const deleteCourse = async (courseId: string): Promise<void> => {
  const response = await axios.delete(`/api/admin/courses/${courseId}`);
  return response.data;
};

const DeleteCourseButton = ({ course }: { course: Course }) => {
  const queryClient = useQueryClient();

  const { mutate: deleteMutation, isPending } = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete course. Please try again.");
      console.error("Delete error:", error);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{course.title}"? This action cannot
            be undone and will remove all associated content and student
            enrollments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              deleteMutation(course.id);
            }}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
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
            <div className="flex items-center space-x-2">
              <Badge
                variant={course.isPublished ? "default" : "secondary"}
                className={`${
                  course.isPublished
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
              <DeleteCourseButton course={course} />
            </div>
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

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-8 rounded-lg bg-red-50 dark:bg-red-900/20">
    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
    <span className="text-red-600 dark:text-red-400">{message}</span>
  </div>
);

const CoursesContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSort, setCurrentSort] = useState(SORT_OPTIONS[0].value);
  const [activeTab, setActiveTab] = useState<"published" | "drafts">(
    "published"
  );

  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: fetchCourses,
  });

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value.toLowerCase());
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setCurrentSort(value);
  }, []);

  const filteredAndSortedCourses = useMemo(() => {
    if (!courses) return { publishedCourses: [], draftCourses: [] };

    // Filter courses based on search query
    const filtered = courses.filter((course) => {
      const searchFields = [
        course.title,
        course.description,
        course.publisher.name,
        course.price.toString(),
      ].map((field) => (field || "").toLowerCase());

      return searchFields.some((field) => field.includes(searchQuery));
    });

    // Sort courses based on selected sort option
    const sortOption = SORT_OPTIONS.find(
      (option) => option.value === currentSort
    );
    const sorted = sortOption
      ? [...filtered].sort(sortOption.sortFn)
      : filtered;

    return {
      publishedCourses: sorted.filter((course) => course.isPublished),
      draftCourses: sorted.filter((course) => !course.isPublished),
    };
  }, [courses, searchQuery, currentSort]);

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

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar value={searchQuery} onChange={handleSearch} />
        <SortButton currentSort={currentSort} onSortChange={handleSortChange} />
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array(6)
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
              ))}
          </div>
        ) : error ? (
          <ErrorMessage message={(error as Error).message} />
        ) : (
          <Tabs
            defaultValue="published"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "published" | "drafts")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger
                value="published"
                className="flex items-center gap-2"
              >
                Published
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  {filteredAndSortedCourses.publishedCourses.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center gap-2">
                Drafts
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800"
                >
                  {filteredAndSortedCourses.draftCourses.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedCourses.publishedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                  {filteredAndSortedCourses.publishedCourses.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full flex items-center justify-center p-8 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        No published courses found
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="drafts">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedCourses.draftCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                  {filteredAndSortedCourses.draftCourses.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full flex items-center justify-center p-8 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        No draft courses found
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        )}
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

//OLD CODE
