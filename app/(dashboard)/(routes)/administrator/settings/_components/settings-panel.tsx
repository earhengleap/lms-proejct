"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Percent,
  Bell,
  ShieldCheck,
  Globe,
  ChevronRight,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEducators: number;
  totalRevenue: number;
}

const Row = ({
  icon: Icon,
  title,
  description,
  control,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  control: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4">
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="shrink-0">{control}</div>
  </div>
);

const Toggle = ({
  defaultOn = false,
  onChange,
}: {
  defaultOn?: boolean;
  onChange?: (v: boolean) => void;
}) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        setOn((v) => !v);
        onChange?.(!on);
      }}
      className={cn(
        "w-11 h-6 rounded-full transition-colors duration-200 relative",
        on ? "bg-slate-900" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
          on && "translate-x-5"
        )}
      />
    </button>
  );
};

export const SettingsPanel = ({ stats }: { stats: Stats }) => {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-slate-200/70 divide-y divide-slate-100">
        <Row
          icon={Percent}
          title="Royalty Rate"
          description="Percentage deducted from each course sale (10% default)."
          control={
            <span className="text-sm font-semibold text-slate-900 tabular-nums">
              10%
            </span>
          }
        />
        <Row
          icon={Bell}
          title="Email Notifications"
          description="Notify admins on new withdrawal and deletion requests."
          control={<Toggle defaultOn />}
        />
        <Row
          icon={ShieldCheck}
          title="Require Instructor Verification"
          description="Manually approve new instructor applications."
          control={<Toggle />}
        />
        <Row
          icon={Globe}
          title="Public Course Indexing"
          description="Allow published courses to appear in search engines."
          control={<Toggle defaultOn />}
        />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Platform Snapshot
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
          {[
            { label: "Users", value: stats.totalUsers },
            { label: "Courses", value: stats.totalCourses },
            { label: "Educators", value: stats.totalEducators },
            {
              label: "Revenue",
              value: `$${Math.round(stats.totalRevenue).toLocaleString()}`,
            },
          ].map((item) => (
            <div key={item.label} className="px-5 py-4">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1 tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
        Save Changes
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
