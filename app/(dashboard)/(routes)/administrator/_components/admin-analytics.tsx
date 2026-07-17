"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface AnalyticsData {
  revenue: {
    daily: { date: string; amount: number }[];
    monthly: { date: string; amount: number }[];
  };
  purchases: {
    daily: { date: string; count: number }[];
    monthly: { date: string; count: number }[];
  };
  categoryDistribution: {
    category: string;
    count: number;
    revenue: number;
  }[];
}

interface AdminAnalyticsProps {
  data: AnalyticsData;
}

const CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-xl shadow-lg px-3 py-2">
        <p className="text-sm font-semibold text-slate-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-xs text-slate-600">
              {entry.name}:{" "}
              {typeof entry.value === "number"
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AdminAnalytics = ({ data }: AdminAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [chartType, setChartType] = useState("revenue");

  const revenueData =
    timeRange === "monthly" ? data.revenue.monthly : data.revenue.daily;
  const purchasesData =
    timeRange === "monthly" ? data.purchases.monthly : data.purchases.daily;

  return (
    <Card className="border-slate-200/70 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900 tracking-tight">
          Analytics Overview
        </CardTitle>
        <div className="flex items-center gap-2">
          {/* Chart type toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setChartType("revenue")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                chartType === "revenue"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Revenue
            </button>
            <button
              onClick={() => setChartType("purchases")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                chartType === "purchases"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Sales
            </button>
            <button
              onClick={() => setChartType("categories")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                chartType === "categories"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <PieChartIcon className="h-3.5 w-3.5" />
              Categories
            </button>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[110px] h-9 rounded-xl border-slate-200/60 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="daily" className="text-sm">Daily</SelectItem>
              <SelectItem value="monthly" className="text-sm">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="bg-slate-50/50 rounded-xl p-4">
          {chartType === "revenue" && (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart
                data={revenueData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `$${v.toLocaleString()}`}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Revenue"
                  stroke="#0088FE"
                  strokeWidth={2}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === "purchases" && (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={purchasesData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
                <Bar
                  dataKey="count"
                  name="Sales"
                  fill="#00C49F"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === "categories" && (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  fill="#0ea5e9"
                  paddingAngle={3}
                  dataKey="revenue"
                  nameKey="category"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
