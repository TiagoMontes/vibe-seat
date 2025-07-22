import { useAtom } from "jotai";
import { useCallback, useRef } from "react";
import {
  chairsAtom,
  chairsLoadingAtom,
  chairCreateLoadingAtom,
  chairUpdateLoadingAtom,
  chairDeleteLoadingAtom,
  paginationAtom,
  chairFiltersAtom,
  chairStatsAtom,
} from "@/app/atoms/chairAtoms";
import { 
  ChairFormData, 
  ChairUpdateFormData, 
  ChairListResponse,
  ChairFilters 
} from "@/app/schemas/chairSchema";

export const useChairs = () => {
  const [chairs, setChairs] = useAtom(chairsAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);
  const [filters, setFilters] = useAtom(chairFiltersAtom);
  const [chairStats, setChairStats] = useAtom(chairStatsAtom);
  const [loading, setLoading] = useAtom(chairsLoadingAtom);
  const [createLoading, setCreateLoading] = useAtom(chairCreateLoadingAtom);
  const [updateLoading, setUpdateLoading] = useAtom(chairUpdateLoadingAtom);
  const [deleteLoading, setDeleteLoading] = useAtom(chairDeleteLoadingAtom);

  const hasLoadedRef = useRef(false);

  const fetchChairs = useCallback(async (customFilters?: Partial<ChairFilters>, showLoading = true) => {
    const shouldShowLoading = showLoading && (!hasLoadedRef.current || pagination.totalItems === 0);
    
    if (shouldShowLoading) {
      setLoading(true);
    }
    
    try {
      const currentFilters = { ...filters, ...customFilters };
      
      const queryParams = new URLSearchParams();
      queryParams.set("page", currentFilters.page.toString());
      queryParams.set("limit", currentFilters.limit.toString());
      if (currentFilters.search) queryParams.set("search", currentFilters.search);
      if (currentFilters.status !== "all") queryParams.set("status", currentFilters.status);
      queryParams.set("sortBy", currentFilters.sortBy);

      const response = await fetch(`/api/chairs/getAll?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || `Failed to fetch chairs: ${response.status}`);
      }
      
      const data: ChairListResponse = await response.json();
      
      setChairs(data.chairs);
      setPagination(data.pagination);
      
      if (customFilters) {
        setFilters(currentFilters);
      }

      if (data.stats) {
        setChairStats(data.stats);
      } else {
        const stats = {
          total: data.pagination.totalItems,
          active: data.chairs.filter(chair => chair.status === "ACTIVE").length,
          maintenance: data.chairs.filter(chair => chair.status === "MAINTENANCE").length,
          inactive: data.chairs.filter(chair => chair.status === "INACTIVE").length,
        };
        setChairStats(stats);
      }
      
      hasLoadedRef.current = true;
      
    } catch (error) {
      console.error("Error fetching chairs:", error);
      throw error;
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  }, [filters, setChairs, setPagination, setFilters, setChairStats, setLoading, pagination.totalItems]);

  const updateFilters = useCallback((newFilters: Partial<ChairFilters>) => {
    const updatedFilters = { 
      ...filters, 
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    };
    
    setFilters(updatedFilters);
    fetchChairs(updatedFilters, false);
  }, [filters, setFilters, fetchChairs]);

  const goToPage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      goToPage(pagination.currentPage + 1);
    }
  }, [pagination.hasNextPage, pagination.currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      goToPage(pagination.currentPage - 1);
    }
  }, [pagination.hasPrevPage, pagination.currentPage, goToPage]);

  const resetFilters = useCallback(() => {
    const defaultFilters: ChairFilters = {
      page: 1,
      limit: 6,
      search: "",
      status: "all",
      sortBy: "newest",
    };
    setFilters(defaultFilters);
    fetchChairs(defaultFilters, false);
  }, [setFilters, fetchChairs]);

  const createChair = useCallback(
    async (chairData: ChairFormData) => {
      setCreateLoading(true);
      try {
        const response = await fetch("/api/chairs/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chairData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create chair");
        }

        const newChair = await response.json();
        
        await fetchChairs(undefined, false);
        
        return newChair;
      } catch (error) {
        console.error("Error creating chair:", error);
        throw error;
      } finally {
        setCreateLoading(false);
      }
    },
    [fetchChairs, setCreateLoading]
  );

  const updateChair = useCallback(
    async (id: number, chairData: ChairUpdateFormData) => {
      setUpdateLoading(true);
      try {
        const response = await fetch(`/api/chairs/update/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chairData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update chair");
        }

        const updatedChair = await response.json();
        
        await fetchChairs(undefined, false);
        
        return updatedChair;
      } catch (error) {
        console.error("Error updating chair:", error);
        throw error;
      } finally {
        setUpdateLoading(false);
      }
    },
    [fetchChairs, setUpdateLoading]
  );

  const deleteChair = useCallback(
    async (id: number) => {
      setDeleteLoading(true);
      try {
        const response = await fetch(`/api/chairs/delete/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete chair");
        }

        if (chairs.length === 1 && pagination.currentPage > 1) {
          await fetchChairs({ page: pagination.currentPage - 1 }, false);
        } else {
          await fetchChairs(undefined, false);
        }
        
        return { success: true };
      } catch (error) {
        console.error("Error deleting chair:", error);
        throw error;
      } finally {
        setDeleteLoading(false);
      }
    },
    [chairs.length, pagination.currentPage, fetchChairs, setDeleteLoading]
  );

  return {
    chairs,
    pagination,
    filters,
    chairStats,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchChairs,
    updateFilters,
    resetFilters,
    goToPage,
    nextPage,
    prevPage,
    createChair,
    updateChair,
    deleteChair,
  };
}; 