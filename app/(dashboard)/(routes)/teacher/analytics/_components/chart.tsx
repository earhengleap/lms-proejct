"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  Sector,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Circle,
  Target,
} from "lucide-react";

interface ChartProps {
  data: {
    name: string;
    total: number;
    courses: { title: string; price: number }[];
  }[];
}

const chartColors = [
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const standardChartTypes = [
  { value: "area", label: "Area", icon: Activity },
  { value: "line", label: "Line", icon: TrendingUp },
  { value: "bar", label: "Bar", icon: BarChart2 },
];

const circularChartTypes = [
  { value: "pie", label: "Pie", icon: PieChartIcon },
  { value: "radar", label: "Radar", icon: Target },
  { value: "radial", label: "Radial", icon: Circle },
];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#64748b" fontSize={12}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#334155"
        fontSize={12}
      >{`$${value.toFixed(2)}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#94a3b8"
        fontSize={11}
      >
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

export const Chart = ({ data }: ChartProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [standardChartType, setStandardChartType] = useState("area");
  const [circularChartType, setCircularChartType] = useState("pie");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-sky-500 animate-spin" />
          Loading charts...
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200/60 shadow-lg">
          <p className="text-sm font-semibold text-slate-900 mb-1">{label}</p>
          <p className="text-sm font-medium text-sky-600">
            ${payload[0].value.toFixed(2)}
          </p>
          {payload[0].payload.courses?.length > 0 && (
            <ul className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
              {payload[0].payload.courses.map((course: any, index: number) => (
                <li key={index} className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700">
                    {course.title}
                  </span>
                  : ${course.price.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderStandardChart = () => {
    switch (standardChartType) {
      case "area":
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        );
      case "line":
        return (
          <LineChart data={data}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        );
      default:
        return null;
    }
  };

  const renderCircularChart = () => {
    switch (circularChartType) {
      case "pie":
        return (
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              fill="#0ea5e9"
              dataKey="total"
              onMouseEnter={onPieEnter}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        );
      case "radar":
        return (
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <PolarRadiusAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Radar
              dataKey="total"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );
      case "radial":
        return (
          <RadialBarChart innerRadius="15%" outerRadius="80%" data={data}>
            <RadialBar
              dataKey="total"
              fill="#ec4899"
              strokeWidth={0}
              cornerRadius={4}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Chart Type Selectors */}
      <div className="flex items-center gap-4 mb-6">
        <Select
          value={standardChartType}
          onValueChange={setStandardChartType}
        >
          <SelectTrigger className="w-[140px] h-9 rounded-xl border-slate-200/60 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {standardChartTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-sm">
                <div className="flex items-center gap-2">
                  <type.icon className="h-3.5 w-3.5 text-slate-500" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={circularChartType}
          onValueChange={setCircularChartType}
        >
          <SelectTrigger className="w-[140px] h-9 rounded-xl border-slate-200/60 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {circularChartTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-sm">
                <div className="flex items-center gap-2">
                  <type.icon className="h-3.5 w-3.5 text-slate-500" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50/50 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={320}>
            {renderStandardChart() ?? <div />}
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-50/50 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={320}>
            {renderCircularChart() ?? <div />}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
