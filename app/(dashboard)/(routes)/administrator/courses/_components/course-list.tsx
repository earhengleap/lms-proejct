"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { SearchBar } from "./search-bar";
import { SortControl } from "./sort-control";
import { CourseGrid } from "./course-grid";
import { CourseSkeleton } from "./course-skeleton";
import { SORT_OPTIONS, type Course, type SortValue } from "./types";

interface CourseListProps {
  courses: Course[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center gap-2 p-8 rounded-2xl bg-red-50 border border-red-100">
    <AlertCircle className="w-5 h-5 text-red-500" />
    <span className="text-sm text-red-600">{message}</span>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
    {Array.from({ length: 6 }).map((_, i) => (
      <CourseSkeleton key={i} />
    ))}
  </div>
);

type TabKey = "published" | "drafts";

export const CourseList = ({ courses, isLoading, error }: CourseListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSort, setCurrentSort] = useState<SortValue>(
    SORT_OPTIONS[0].value
  );
  const [activeTab, setActiveTab] = useState<TabKey>("published");

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value.toLowerCase());
  }, []);

  const handleSortChange = useCallback((value: SortValue) => {
    setCurrentSort(value);
  }, []);

  const { published, drafts } = useMemo(() => {
    if (!courses) return { published: [], drafts: [] };

    const filtered = courses.filter((course) => {
      const fields = [
        course.title,
        course.description,
        course.publisher.name,
        course.price != null ? course.price.toString() : "",
      ]
        .map((f) => (f || "").toLowerCase())
        .filter(Boolean);

      return searchQuery === "" || fields.some((f) => f.includes(searchQuery));
    });

    const sortOption = SORT_OPTIONS.find((o) => o.value === currentSort);
    const sorted = sortOption ? [...filtered].sort(sortOption.sortFn) : filtered;

    return {
      published: sorted.filter((c) => c.isPublished),
      drafts: sorted.filter((c) => !c.isPublished),
    };
  }, [courses, searchQuery, currentSort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={searchQuery} onChange={handleSearch} />
        <SortControl currentSort={currentSort} onSortChange={handleSortChange} />
      </div>

      {isLoading ? (
        <SkeletonGrid />
      ) : error ? (
        <ErrorMessage message={error.message} />
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabKey)}
          className="w-full"
        >
          <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-2 bg-slate-100 p-1 rounded-xl h-auto gap-1">
            <TabsTrigger
              value="published"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
            >
              Published
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 rounded-full"
              >
                {published.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="drafts"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
            >
              Drafts
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600 rounded-full"
              >
                {drafts.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-6">
            <CourseGrid
              courses={published}
              emptyMessage="No published courses found."
            />
          </TabsContent>
          <TabsContent value="drafts" className="mt-6">
            <CourseGrid
              courses={drafts}
              emptyMessage="No draft courses found."
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
