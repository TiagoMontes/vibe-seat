import { Button } from "@/app/components/ui/button";

interface PaginationProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  currentPage: number;
  nextPage: number;
  prevPage: number;
  lastPage: number;
  fetchAvailableChairs: (date: string, page: number, append: boolean) => void;
  selectedDate: string;
}

export const PaginationComponent = ({
  hasNextPage,
  hasPrevPage,
  currentPage,
  nextPage,
  prevPage,
  lastPage,
  fetchAvailableChairs,
  selectedDate,
}: PaginationProps) => {
  const handleClick = (page: number) => {
    fetchAvailableChairs(selectedDate, page, false);
  };

  return (
    <div className="flex gap-2 items-center justify-center mt-4">
      {/* Previous */}
      {hasPrevPage && (
        <Button variant="outline" onClick={() => handleClick(prevPage)}>
          Previous
        </Button>
      )}

      {/* First page and ellipsis */}
      {currentPage > 3 && (
        <>
          <Button variant="ghost" onClick={() => handleClick(1)}>
            1
          </Button>
          <span className="text-gray-500">...</span>
        </>
      )}

      {/* Previous page number */}
      {hasPrevPage && prevPage !== 1 && (
        <Button variant="ghost" onClick={() => handleClick(prevPage)}>
          {prevPage}
        </Button>
      )}

      {/* Current page */}
      <Button className="bg-black text-white hover:bg-black" disabled>
        {currentPage}
      </Button>

      {/* Next page number */}
      {hasNextPage && nextPage !== lastPage && (
        <Button variant="ghost" onClick={() => handleClick(nextPage)}>
          {nextPage}
        </Button>
      )}

      {/* Last page and ellipsis */}
      {lastPage > currentPage + 2 && (
        <>
          <span className="text-gray-500">...</span>
          <Button variant="ghost" onClick={() => handleClick(lastPage)}>
            {lastPage}
          </Button>
        </>
      )}

      {/* Next */}
      {hasNextPage && (
        <Button variant="outline" onClick={() => handleClick(nextPage)}>
          Next
        </Button>
      )}
    </div>
  );
};