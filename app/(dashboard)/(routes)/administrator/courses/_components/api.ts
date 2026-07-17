import axios from "axios";
import type { Course } from "./types";

export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const response = await axios.get<Course[]>("/api/admin/courses");
    return response.data;
  } catch {
    throw new Error("Failed to fetch courses. Please try again later.");
  }
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  await axios.delete(`/api/admin/courses/${courseId}`);
};
