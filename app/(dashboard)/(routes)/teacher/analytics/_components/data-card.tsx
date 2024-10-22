import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DataCardProps {
  value: number;
  label: string;
  shouldFormat?: boolean;
  format?: (value: number) => string;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
  color?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  value,
  label,
  shouldFormat = false,
  format,
  description,
  icon,
  trend,
  color = "text-gray-600",
}) => {
  const formattedValue = shouldFormat
    ? formatPrice(value)
    : format
      ? format(value)
      : value;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon && <div className={cn("w-4 h-4", color)}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div
            className={cn(
              "text-xs font-medium mt-2",
              trend >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {trend >= 0 ? "+" : "-"}
            {Math.abs(trend)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};
