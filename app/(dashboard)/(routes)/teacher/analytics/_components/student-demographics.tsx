"use client";

import { Users } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
          <Users className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No student data yet</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Demographics will appear once students enroll
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percent = total > 0 ? (item.count / total) * 100 : 0;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">
                {item.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {item.count} students
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  {percent.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="bg-emerald-500 h-full rounded-full"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
