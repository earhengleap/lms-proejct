import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getAllCourses } from "@/actions/get-courses";
import { InstantSearch } from "./_components/instant-search";
import { Suspense } from "react";

const SearchPage = async () => {
  const { userId } = auth();

  const [courses, categories] = await Promise.all([
    getAllCourses(userId || undefined),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto">
      <Suspense fallback={<div className="text-sm text-slate-400">Loading...</div>}>
        <InstantSearch
          courses={courses}
          categories={categories}
          userId={userId || undefined}
        />
      </Suspense>
    </div>
  );
};

export default SearchPage;
