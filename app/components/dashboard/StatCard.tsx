import React from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    text: "text-green-700",
    border: "border-green-200",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "text-yellow-600",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    text: "text-red-700",
    border: "border-red-200",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  gray: {
    bg: "bg-gray-50",
    icon: "text-gray-600",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

const StatCardComponent: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue",
}) => {
  const colors = colorClasses[color];

  // Memoizar o valor formatado
  const formattedValue = React.useMemo(() => {
    return typeof value === "number" ? value.toLocaleString() : value;
  }, [value]);

  return (
    <Card
      className={`${colors.bg} ${colors.border} hover:shadow-md transition-shadow`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${colors.text}`}>
                {formattedValue}
              </p>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-white ${colors.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

StatCardComponent.displayName = "StatCard";

export const StatCard = React.memo(StatCardComponent);
