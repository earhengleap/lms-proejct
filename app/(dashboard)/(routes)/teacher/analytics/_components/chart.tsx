"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const standardChartTypes = [
  { value: "area", label: "Area Chart", icon: Activity },
  { value: "line", label: "Line Chart", icon: TrendingUp },
  { value: "bar", label: "Bar Chart", icon: BarChart2 },
];

const circularChartTypes = [
  { value: "pie", label: "Pie Chart", icon: PieChartIcon },
  { value: "radar", label: "Radar Chart", icon: Target },
  { value: "radial", label: "Radial Chart", icon: Circle },
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
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
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
        fill="#333"
      >{`$${value.toFixed(2)}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
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
      <Card className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-2xl font-semibold text-gray-400">
          Loading chart...
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-bold text-lg mb-2">{label}</p>
          <p className="text-lg font-semibold text-blue-600">
            Total Revenue: ${payload[0].value.toFixed(2)}
          </p>
          <ul className="mt-2">
            {payload[0].payload.courses.map((course: any, index: number) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{course.title}:</span> $
                {course.price.toFixed(2)}
              </li>
            ))}
          </ul>
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
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke={chartColors[0]}
              fill={chartColors[0]}
            />
          </AreaChart>
        );
      case "line":
        return (
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke={chartColors[1]}
              strokeWidth={2}
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill={chartColors[2]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        );
      default:
        return <div>No Standard Chart Selected</div>;
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
              innerRadius={60}
              outerRadius={80}
              fill={chartColors[3]}
              dataKey="total"
              onMouseEnter={onPieEnter}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );
      case "radar":
        return (
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar
              dataKey="total"
              stroke={chartColors[4]}
              fill={chartColors[4]}
              fillOpacity={0.6}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );
      case "radial":
        return (
          <RadialBarChart innerRadius="10%" outerRadius="80%" data={data}>
            <RadialBar dataKey="total" fill={chartColors[5]} />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        );
      default:
        return <div>No Circular Chart Selected</div>;
    }
  };

  return (
    <Card className="w-full shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-sky-500">
        <CardTitle className="flex items-center justify-between text-white">
          Transactions
          <div className="flex space-x-4">
            <Select
              value={standardChartType}
              onValueChange={setStandardChartType}
            >
              <SelectTrigger className="w-[180px] bg-white text-gray-800">
                <SelectValue placeholder="Standard chart type" />
              </SelectTrigger>
              <SelectContent>
                {standardChartTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <type.icon className="mr-2 h-4 w-4" />
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
              <SelectTrigger className="w-[180px] bg-white text-gray-800">
                <SelectValue placeholder="Circular chart type" />
              </SelectTrigger>
              <SelectContent>
                {circularChartTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <type.icon className="mr-2 h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={400}>
            {renderStandardChart()}
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={400}>
            {renderCircularChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

//OLD CODE
