// app/(dashboard)/(routes)/teacher/analytics/_components/student-demographics.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-1/3 text-sm">{item.category}</div>
              <div className="w-2/3">
                <div className="bg-gray-200 h-4 rounded-full">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${(item.count / total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right text-sm">
                {((item.count / total) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
