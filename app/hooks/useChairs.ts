import { useAtom } from "jotai";
import { useCallback, useRef, useEffect } from "react";
import { useToast } from "./useToast";
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
  
  const { success, error } = useToast();

  const hasLoadedRef = useRef(false);

  // fetchChairs NÃO depende de filters, recebe explicitamente os filtros a usar
  const fetchChairs = useCallback(async (customFilters: ChairFilters, showLoading = true) => {
    const shouldShowLoading = showLoading && (!hasLoadedRef.current || pagination.totalItems === 0);
    
    if (shouldShowLoading) {
      setLoading(true);
    }
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", customFilters.page.toString());
      queryParams.set("limit", customFilters.limit.toString());
      if (customFilters.search) queryParams.set("search", customFilters.search);
      if (customFilters.status !== "all") queryParams.set("status", customFilters.status);
      queryParams.set("sortBy", customFilters.sortBy);

      const response = await fetch(`/api/chairs/getAll?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || `Failed to fetch chairs: ${response.status}`);
      }
      
      const data: ChairListResponse = await response.json();
      
      setChairs(data.chairs);
      // Atualiza paginação incluindo nextPage e prevPage
      setPagination({
        ...data.pagination,
        nextPage: (data.pagination as any).nextPage ?? null,
        prevPage: (data.pagination as any).prevPage ?? null,
      });
      
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
  }, [setChairs, setChairStats, setLoading, pagination.totalItems, setPagination]);

  // Atualizar filtros (apenas setFilters)
  const updateFilters = useCallback((newFilters: Partial<ChairFilters>) => {
    const updatedFilters = { 
      ...filters, 
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    };
    
    setFilters(updatedFilters);
  }, [filters, setFilters]);

  // Resetar filtros (apenas setFilters)
  const resetFilters = useCallback(() => {
    const defaultFilters: ChairFilters = {
      page: 1,
      limit: 6,
      search: "",
      status: "all",
      sortBy: "newest",
    };
    setFilters(defaultFilters);
  }, [setFilters]);

  // Funções de paginação
  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, [setFilters]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage && pagination.nextPage) {
      setFilters((prev) => ({ ...prev, page: pagination.nextPage! }));
    }
  }, [pagination.hasNextPage, pagination.nextPage, setFilters]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage && pagination.prevPage) {
      setFilters((prev) => ({ ...prev, page: pagination.prevPage! }));
    }
  }, [pagination.hasPrevPage, pagination.prevPage, setFilters]);

  // Buscar cadeiras sempre que filters mudar
  useEffect(() => {
    fetchChairs(filters, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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
        
        await fetchChairs(filters, false);
        success("Cadeira criada com sucesso!");
        
        return newChair;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        error("Erro ao criar cadeira: " + errorMessage);
        console.error("Error creating chair:", err);
        throw err;
      } finally {
        setCreateLoading(false);
      }
    },
    [fetchChairs, setCreateLoading, filters]
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
        
        await fetchChairs(filters, false);
        success("Cadeira atualizada com sucesso!");
        
        return updatedChair;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        error("Erro ao atualizar cadeira: " + errorMessage);
        console.error("Error updating chair:", err);
        throw err;
      } finally {
        setUpdateLoading(false);
      }
    },
    [fetchChairs, setUpdateLoading, filters]
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
          // Passa todos os filtros, só mudando a página
          await fetchChairs({ ...filters, page: pagination.currentPage - 1 }, false);
        } else {
          await fetchChairs(filters, false);
        }
        
        success("Cadeira excluída com sucesso!");
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        error("Erro ao excluir cadeira: " + errorMessage);
        console.error("Error deleting chair:", err);
        throw err;
      } finally {
        setDeleteLoading(false);
      }
    },
    [chairs.length, pagination.currentPage, fetchChairs, setDeleteLoading, filters]
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