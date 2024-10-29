"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { useState } from "react";
import {
  LineChart as LineChartIcon,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Circle,
} from "lucide-react";

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const AdminAnalytics = ({ data }: AdminAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [chartType, setChartType] = useState("revenue");

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-muted-foreground">
                {entry.name}:{" "}
                {typeof entry.value === "number"
                  ? chartType === "revenue"
                    ? `$${entry.value.toLocaleString()}`
                    : entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderRevenueChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={
          timeRange === "monthly" ? data.revenue.monthly : data.revenue.daily
        }
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          name="Revenue"
          stroke="#0088FE"
          fillOpacity={1}
          fill="url(#colorRevenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderPurchasesChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={
          timeRange === "monthly"
            ? data.purchases.monthly
            : data.purchases.daily
        }
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          name="Purchases"
          fill="currentColor"
          className="fill-primary"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderCategoryChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data.categoryDistribution}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={140}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="revenue"
          label={({ name, value, percent }) =>
            `${name} ($${value.toLocaleString()}, ${(percent * 100).toFixed(1)}%)`
          }
        >
          {data.categoryDistribution.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              className="stroke-background hover:opacity-80"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderRadialChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadialBarChart
        innerRadius="10%"
        outerRadius="80%"
        data={data.categoryDistribution}
        startAngle={180}
        endAngle={-180}
      >
        <RadialBar
          dataKey="revenue"
          className="fill-primary"
          background={{ className: "fill-muted" }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadialBarChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart
        cx="50%"
        cy="50%"
        outerRadius="80%"
        data={data.categoryDistribution}
      >
        <PolarGrid className="stroke-muted" />
        <PolarAngleAxis
          dataKey="category"
          className="text-muted-foreground fill-muted-foreground"
        />
        <PolarRadiusAxis className="text-muted-foreground" />
        <Radar
          name="Revenue"
          dataKey="revenue"
          className="fill-primary/50 stroke-primary"
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="col-span-full">
      <div className="p-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <LineChartIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Analytics Overview</h2>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </header>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList>
            <TabsTrigger
              value="revenue"
              onClick={() => setChartType("revenue")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger
              value="purchases"
              onClick={() => setChartType("purchases")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Purchases
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              onClick={() => setChartType("categories")}
            >
              <PieChartIcon className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="radial" onClick={() => setChartType("radial")}>
              <Circle className="h-4 w-4 mr-2" />
              Radial
            </TabsTrigger>
            <TabsTrigger value="radar" onClick={() => setChartType("radar")}>
              <Circle className="h-4 w-4 mr-2" />
              Radar
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="revenue">{renderRevenueChart()}</TabsContent>
            <TabsContent value="purchases">
              {renderPurchasesChart()}
            </TabsContent>
            <TabsContent value="categories">
              {renderCategoryChart()}
            </TabsContent>
            <TabsContent value="radial">{renderRadialChart()}</TabsContent>
            <TabsContent value="radar">{renderRadarChart()}</TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
};
