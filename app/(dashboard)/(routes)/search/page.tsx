import React from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCourses } from "@/actions/get-courses";
import { Categories } from "./_components/categories";
import SearchInput from "@/components/search-input";
import CoursesList from "@/components/courses-list";

interface SearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId } = auth();

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const courses = await getCourses({
    userId: userId || undefined,  //! Pass userId to getCourses; undefined if not logged in
    ...searchParams,
  });

  return (
    <>
      <div className="px-6 pt-6 lg:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default SearchPage;
