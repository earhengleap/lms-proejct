// _components/student-demographics.tsx

import { PieChart } from "lucide-react";

interface DemographicData {
  category: string;
  count: number;
}

interface StudentDemographicsProps {
  data: DemographicData[];
}

export const StudentDemographics: React.FC<StudentDemographicsProps> = ({
  data,
}) => {
  const isEmpty = !data || data.length === 0;
  const total = isEmpty ? 0 : data.reduce((sum, item) => sum + item.count, 0);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <PieChart className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No Student Data Yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500 max-w-[250px]">
          Your student demographic information will appear here once students
          enroll in your courses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.category}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.count} students
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {((item.count / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="relative w-full">
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 dark:bg-green-600 h-full rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
