"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { searchCourses } from "@/actions/search-courses";
import CoursesList from "@/components/courses-list";
import { Category, Course, Publisher } from "@prisma/client";
import { CourseGridSkeleton } from "./course-skeleton";

type CourseWithProgress = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
  publisher: Publisher | null;
};

type SearchResults = {
  courses: CourseWithProgress[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

interface DynamicSearchResultsProps {
  userId?: string;
  initialCourses: CourseWithProgress[];
}

export const DynamicSearchResults = ({
  userId,
  initialCourses,
}: DynamicSearchResultsProps) => {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResults>({
    courses: initialCourses,
    totalCount: initialCourses.length,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);

  const title = searchParams.get("title") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const sort = searchParams.get("sort") || undefined;
  const page = parseInt(searchParams.get("page") || "1");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchCourses({
        userId,
        title,
        categoryId,
        sort,
        page,
        pageSize: 12,
      });
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, title, categoryId, sort, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return <CourseGridSkeleton count={6} />;
  }

  return (
    <>
      <CoursesList
        items={results.courses.map((course) => ({
          ...course,
          publisherName: course.publisher?.name ?? "Unknown Publisher",
        }))}
        userId={userId}
      />
      {results.totalPages > 1 && (
        <Pagination
          currentPage={results.currentPage}
          totalPages={results.totalPages}
          searchParams={searchParams}
        />
      )}
    </>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: URLSearchParams;
}) => {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    return `?${params.toString()}`;
  };

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-8"
      aria-label="Pagination"
    >
      {currentPage > 1 && (
        <a
          href={createPageUrl(currentPage - 1)}
          className="px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-500"
        >
          Previous
        </a>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === totalPages ||
              (p >= currentPage - 1 && p <= currentPage + 1)
          )
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && p - arr[idx - 1] > 1 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              {p === currentPage ? (
                <span className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md">
                  {p}
                </span>
              ) : (
                <a
                  href={createPageUrl(p)}
                  className="px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-500 hover:bg-sky-50 rounded-md transition-colors"
                >
                  {p}
                </a>
              )}
            </span>
          ))}
      </div>
      {currentPage < totalPages && (
        <a
          href={createPageUrl(currentPage + 1)}
          className="px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-500"
        >
          Next
        </a>
      )}
    </nav>
  );
};
