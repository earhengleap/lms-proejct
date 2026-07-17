"use server";

import { getCourses } from "./get-courses";

type SearchCoursesInput = {
  userId?: string;
  title?: string;
  categoryId?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export const searchCourses = async (input: SearchCoursesInput) => {
  return getCourses({
    userId: input.userId,
    title: input.title,
    categoryId: input.categoryId,
    sort: input.sort,
    page: input.page || 1,
    pageSize: input.pageSize || 12,
  });
};
