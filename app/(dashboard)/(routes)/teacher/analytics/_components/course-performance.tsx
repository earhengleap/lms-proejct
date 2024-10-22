// app/(dashboard)/(routes)/teacher/analytics/_components/course-performance.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CourseData {
  title: string;
  completionRate: number;
}

interface CoursePerformanceProps {
  data: CourseData[];
}

export const CoursePerformance: React.FC<CoursePerformanceProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((course, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1/3 text-sm">{course.title}</div>
              <div className="w-2/3">
                <div className="bg-gray-200 h-4 rounded-full">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${course.completionRate * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right text-sm">
                {(course.completionRate * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};