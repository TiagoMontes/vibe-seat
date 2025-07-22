"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onNextPage,
  onPrevPage,
  className,
}: PaginationProps) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevPage}
        disabled={!hasPrevPage}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <div key={`dots-${index}`} className="px-2">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className={cn("min-w-[36px]", isActive && "bg-black text-white")}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={!hasNextPage}
        className="flex items-center gap-1"
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export const PaginationInfo = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className,
}: PaginationInfoProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("text-sm text-gray-600", className)}>
      Mostrando <span className="font-medium">{startItem}</span> a{" "}
      <span className="font-medium">{endItem}</span> de{" "}
      <span className="font-medium">{totalItems}</span> resultados
      {totalPages > 1 && (
        <>
          {" "}
          • Página <span className="font-medium">{currentPage}</span> de{" "}
          <span className="font-medium">{totalPages}</span>
        </>
      )}
    </div>
  );
};
