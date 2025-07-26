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
    text: "text-blue-800",
    border: "border-blue-100",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    text: "text-green-800",
    border: "border-green-100",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "text-yellow-600",
    text: "text-yellow-800",
    border: "border-yellow-100",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    text: "text-red-800",
    border: "border-red-100",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    text: "text-purple-800",
    border: "border-purple-100",
  },
  gray: {
    bg: "bg-gray-50",
    icon: "text-gray-600",
    text: "text-gray-800",
    border: "border-gray-100",
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

  const formattedValue = React.useMemo(() => {
    return typeof value === "number" ? value.toLocaleString() : value;
  }, [value]);

  return (
    <Card
      className={`group ${colors.bg} ${colors.border} border rounded-2xl transition-shadow hover:shadow-xl hover:-translate-y-1 transform duration-200`}
    >
      <CardContent className="p-6 sm:p-5 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className={`text-3xl font-bold ${colors.text}`}>
                {formattedValue}
              </p>
              {trend && (
                <span
                  className={`text-sm font-semibold ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div
            className={`p-3 rounded-xl bg-white shadow-sm ${colors.icon} transition-transform group-hover:scale-110`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

StatCardComponent.displayName = "StatCard";

export const StatCard = React.memo(StatCardComponent);
