// _components/course-performance.tsx

import { BookOpen } from "lucide-react";

interface CourseData {
  title: string;
  completionRate: number;
}

interface CoursePerformanceProps {
  data: CourseData[];
}

export const CoursePerformance: React.FC<CoursePerformanceProps> = ({
  data,
}) => {
  const isEmpty = !data || data.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No Course Data Available
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500 max-w-[250px]">
          Start creating and publishing courses to see completion rates and
          performance metrics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((course, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {course.title}
            </span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {(course.completionRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="relative w-full">
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 dark:bg-blue-600 h-full rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${course.completionRate * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
