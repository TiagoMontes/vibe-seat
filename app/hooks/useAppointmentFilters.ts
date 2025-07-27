import { useCallback } from "react";
import { APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_SORT_OPTIONS } from "@/app/lib/utils";
import { FilterHandlers, AppointmentFilters as ApiAppointmentFilters } from "@/app/types/api";

type AppointmentFiltersType = ApiAppointmentFilters | {
  status: "all" | "SCHEDULED" | "CONFIRMED" | "CANCELLED";
  page: number;
  limit: number;
  search: string;
  sortBy: "newest" | "oldest";
};

interface UseAppointmentFiltersProps {
  filters: AppointmentFiltersType;
  setFilters: (filters: AppointmentFiltersType | ((prev: AppointmentFiltersType) => AppointmentFiltersType)) => void;
}

export const useAppointmentFilters = ({ filters, setFilters }: UseAppointmentFiltersProps): FilterHandlers & { statusOptions: typeof APPOINTMENT_STATUS_OPTIONS; sortOptions: typeof APPOINTMENT_SORT_OPTIONS } => {
  
  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev: AppointmentFiltersType) => ({
      ...prev,
      search,
      page: 1,
    }));
  }, [setFilters]);

  const handleStatusChange = useCallback((status: string) => {
    setFilters((prev: AppointmentFiltersType) => ({
      ...prev,
      status: status as "all" | "SCHEDULED" | "CONFIRMED" | "CANCELLED",
      page: 1,
    }));
  }, [setFilters]);

  const handleSortChange = useCallback((sortBy: string) => {
    setFilters((prev: AppointmentFiltersType) => ({
      ...prev,
      sortBy: sortBy as "newest" | "oldest",
      page: 1,
    }));
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    setFilters((prev: AppointmentFiltersType) => ({
      ...prev,
      search: "",
      status: "SCHEDULED", // Padrão para admin: manter "SCHEDULED" em vez de "all"
      sortBy: "newest",
      page: 1,
    }));
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev: AppointmentFiltersType) => ({ ...prev, page }));
  }, [setFilters]);

  const hasActiveFilters = 
    (filters.search && filters.search.trim() !== "") ||
    (filters.status !== "all" && filters.status !== "SCHEDULED") || // "SCHEDULED" não é considerado filtro ativo para admin
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