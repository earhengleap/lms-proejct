"use client";

import { useMemo, useState } from "react";
import { Category, Course, Publisher } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import CourseCard from "@/components/course-card";
import {
  BookOpen,
  LayoutGrid,
  LayoutList,
  Grid2x2,
  Grid3x3,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Flag from "react-world-flags";

type CourseWithProgress = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  publisher: Publisher | null;
};

interface InstantSearchProps {
  courses: CourseWithProgress[];
  categories: Category[];
  userId?: string;
}

type GridCols = 2 | 3 | 4;

const gridClasses: Record<GridCols, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

const flagMap: Record<string, string> = {
  Khmer: "KH",
  English: "US",
  Spanish: "ES",
  Chinese: "CN",
  French: "FR",
  German: "DE",
  Vietnamese: "VN",
  Thai: "TH",
  Italian: "IT",
  Japanese: "JP",
  Korean: "KR",
  Russian: "RU",
  Dutch: "NL",
  Swedish: "SE",
  Finnish: "FI",
  Norwegian: "NO",
  Danish: "DK",
  Polish: "PL",
  Turkish: "TR",
  Hindi: "IN",
  Bengali: "BD",
  Punjabi: "IN",
  Persian: "IR",
  Indonesian: "ID",
  Malay: "MY",
};

const GridIcon = ({ cols, isActive }: { cols: GridCols; isActive: boolean }) => {
  const className = cn("h-4 w-4", isActive ? "text-sky-600" : "text-slate-400");
  switch (cols) {
    case 2:
      return <Grid2x2 className={className} />;
    case 3:
      return <Grid3x3 className={className} />;
    case 4:
      return <LayoutGrid className={className} />;
  }
};

export const InstantSearch = ({
  courses,
  categories,
  userId,
}: InstantSearchProps) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [gridCols, setGridCols] = useState<GridCols>(3);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCourses = useMemo(() => {
    let result = courses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((course) => {
        const searchFields = [course.title, course.category?.name]
          .filter(Boolean)
          .map((field) => field!.toLowerCase());
        return searchFields.some((field) => field.includes(query));
      });
    }

    if (selectedCategory) {
      result = result.filter(
        (course) =>
          course.categoryId === selectedCategory ||
          course.category?.id === selectedCategory
      );
    }

    return result;
  }, [courses, searchQuery, selectedCategory]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {searchQuery ? (
              <>
                &quot;<span className="text-sky-600">{searchQuery}</span>&quot;
              </>
            ) : (
              "All Courses"
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Grid Toggle */}
        <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {([2, 3, 4] as GridCols[]).map((cols) => (
            <button
              key={cols}
              onClick={() => setGridCols(cols)}
              className={cn(
                "relative h-9 w-9 flex items-center justify-center rounded-lg transition-all duration-200",
                gridCols === cols
                  ? "bg-slate-100"
                  : "hover:bg-slate-50"
              )}
            >
              <GridIcon cols={cols} isActive={gridCols === cols} />
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="relative">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0",
              !selectedCategory
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <LayoutList className="h-4 w-4" />
            All Languages
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
              className={cn(
                "relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0",
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {flagMap[cat.name] && (
                <div className="w-5 h-4 rounded overflow-hidden flex items-center justify-center shadow-sm">
                  <Flag
                    code={flagMap[cat.name]}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filteredCourses.length > 0 ? (
          <motion.div
            layout
            className={cn("grid gap-5", gridClasses[gridCols])}
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.04,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <CourseCard
                  id={course.id}
                  title={course.title}
                  imageUrl={course.imageUrl!}
                  chaptersLength={course.chapters.length}
                  price={course.price!}
                  progress={course.progress}
                  category={course.category?.name!}
                  publisherName={course.publisher?.name ?? "Unknown"}
                  firstChapterId={course.chapters[0]?.id || ""}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
              <BookOpen className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1.5">
              No courses found
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Try adjusting your search to find what you&apos;re looking for.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
