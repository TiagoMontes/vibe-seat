import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface PaginationProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  currentPage: number;
  lastPage: number;
  goToPage: (date: string, page: number, append: boolean) => void;
  selectedDate: string;
  totalItems?: number;
}

export const PaginationComponent = ({
  hasNextPage,
  hasPrevPage,
  currentPage,
  lastPage,
  goToPage,
  selectedDate,
  totalItems,
}: PaginationProps) => {
  const handlePageChange = (page: number) => {
    goToPage(selectedDate, page, false);
  };

  if (lastPage <= 1) return null;

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Mostrando página {currentPage} de {lastPage}
            {totalItems && ` (${totalItems} itens)`}
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Anterior</span>
            </Button>
            <span className="text-xs sm:text-sm text-gray-600 px-2">
              {currentPage} / {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <span className="hidden sm:inline mr-1">Próxima</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
