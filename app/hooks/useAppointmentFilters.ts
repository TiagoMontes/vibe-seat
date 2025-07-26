import { useCallback } from "react";
import { APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_SORT_OPTIONS } from "@/app/lib/utils";
import { FilterHandlers } from "@/app/types/api";

interface UseAppointmentFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
}

export const useAppointmentFilters = ({ filters, setFilters }: UseAppointmentFiltersProps): FilterHandlers & { statusOptions: typeof APPOINTMENT_STATUS_OPTIONS; sortOptions: typeof APPOINTMENT_SORT_OPTIONS } => {
  
  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev: any) => ({
      ...prev,
      search,
      page: 1,
    }));
  }, [setFilters]);

  const handleStatusChange = useCallback((status: string) => {
    setFilters((prev: any) => ({
      ...prev,
      status: status as "all" | "SCHEDULED" | "CONFIRMED" | "CANCELLED",
      page: 1,
    }));
  }, [setFilters]);

  const handleSortChange = useCallback((sortBy: string) => {
    setFilters((prev: any) => ({
      ...prev,
      sortBy: sortBy as "newest" | "oldest",
      page: 1,
    }));
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    setFilters((prev: any) => ({
      ...prev,
      search: "",
      status: "all",
      sortBy: "newest",
      page: 1,
    }));
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev: any) => ({ ...prev, page }));
  }, [setFilters]);

  const hasActiveFilters = 
    (filters.search && filters.search.trim() !== "") ||
    filters.status !== "all" ||
    filters.sortBy !== "newest";

  return {
    handleSearchChange,
    handleStatusChange,
    handleSortChange,
    handleClearFilters,
    handlePageChange,
    hasActiveFilters,
    statusOptions: APPOINTMENT_STATUS_OPTIONS,
    sortOptions: APPOINTMENT_SORT_OPTIONS,
  };
};