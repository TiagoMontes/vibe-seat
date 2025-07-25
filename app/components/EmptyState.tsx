import React from "react";
import { Button } from "@/app/components/ui/button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  clearLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  hasActiveFilters = false,
  onClearFilters,
  clearLabel = "Limpar Filtros",
}) => (
  <div className="flex flex-col items-center justify-center py-12 w-full">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {hasActiveFilters && onClearFilters && (
      <Button variant="outline" onClick={onClearFilters}>
        {clearLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
