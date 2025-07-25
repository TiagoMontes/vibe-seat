import React from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import { Search } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface GenericFilterProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isSearchPending?: boolean;

  statusOptions?: Option[];
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statusLabel?: string;

  sortOptions?: Option[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortLabel?: string;

  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  showClearButton?: boolean;
}

export const GenericFilter: React.FC<GenericFilterProps> = ({
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  isSearchPending = false,

  statusOptions = [],
  statusValue = "",
  onStatusChange,
  statusLabel = "Status",

  sortOptions = [],
  sortValue = "",
  onSortChange,
  sortLabel = "Ordenar por",

  onClearFilters,
  hasActiveFilters = false,
  showClearButton = true,
}) => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Busca */}
          <div className="relative w-full">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                isSearchPending
                  ? "text-blue-500 animate-pulse"
                  : "text-gray-400"
              }`}
            />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`pl-10 transition-colors ${
                isSearchPending ? "border-blue-300 ring-1 ring-blue-200" : ""
              }`}
            />
            {isSearchPending && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Status */}
          {statusOptions.length > 0 && onStatusChange && (
            <div className="flex items-center gap-2 w-full lg:w-40">
              <Select
                value={statusValue}
                onValueChange={onStatusChange}
                className="w-full lg:w-40"
              >
                <SelectTrigger className="w-full lg:w-40">
                  <span>
                    {statusOptions.find((o) => o.value === statusValue)
                      ?.label || statusLabel}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Ordenação */}
          {sortOptions.length > 0 && onSortChange && (
            <div className="flex items-center gap-2 w-full lg:w-40">
              <Select
                value={sortValue}
                onValueChange={onSortChange}
                className="w-full lg:w-40"
              >
                <SelectTrigger className="w-full lg:w-40">
                  <span>
                    {sortOptions.find((o) => o.value === sortValue)?.label ||
                      sortLabel}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Limpar Filtros */}
          {showClearButton && onClearFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="whitespace-nowrap w-full lg:w-auto"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GenericFilter;
