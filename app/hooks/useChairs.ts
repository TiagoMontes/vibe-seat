import { useCallback, useState, useRef } from 'react';
import { ChairFilters, CreateChairRequest, UpdateChairRequest, ChairListResponse, Chair, Pagination } from '@/app/types/api';

export const useChairs = () => {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    lastPage: 1,
  });
  const [chairStatus, setChairStatus] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
  });
  const [filters, setFilters] = useState<ChairFilters>({
    page: 1,
    limit: 6,
    search: "",
    status: "all",
    sortBy: "newest",
  });
  const [loading, setLoading] = useState(false);

  // Usar useRef para manter a referência dos filtros atuais
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchChairs = useCallback(async (customFilters?: ChairFilters) => {
    setLoading(true);
    try {
      // Usar os filtros passados ou os filtros atuais
      const currentFilters = customFilters || filtersRef.current;
      
      const queryParams = new URLSearchParams();
      
      if (currentFilters.page) queryParams.set('page', currentFilters.page.toString());
      if (currentFilters.limit) queryParams.set('limit', currentFilters.limit.toString());
      if (currentFilters.search) queryParams.set('search', currentFilters.search);
      if (currentFilters.status) queryParams.set('status', currentFilters.status);
      if (currentFilters.sortBy) queryParams.set('sortBy', currentFilters.sortBy);

      const response = await fetch(`/api/chairs/getAll?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar cadeiras');
      }

      const data: ChairListResponse = await response.json();
      
      setChairs(data.chairs || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        lastPage: 1,
      });
      
      // Calcula stats baseado nos dados retornados
      const stats = {
        total: data.pagination?.totalItems || 0,
        active: data.chairs?.filter(chair => chair.status === "ACTIVE").length || 0,
        maintenance: data.chairs?.filter(chair => chair.status === "MAINTENANCE").length || 0,
        inactive: data.chairs?.filter(chair => chair.status === "INACTIVE").length || 0,
      };
      setChairStatus(stats);
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar cadeiras:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []); // Removido as dependências para evitar loops

  const createChair = useCallback(async (chairData: CreateChairRequest) => {
    try {
      const response = await fetch('/api/chairs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chairData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar cadeira');
      }

      const newChair = await response.json();
      
      // Recarregar os dados com os filtros atuais
      await fetchChairs();
      
      return newChair;
    } catch (error) {
      console.error('Erro ao criar cadeira:', error);
      throw error;
    }
  }, [fetchChairs]);

  const updateChair = useCallback(async (id: number, chairData: UpdateChairRequest) => {
    try {
      const response = await fetch(`/api/chairs/update/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chairData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar cadeira');
      }

      const updatedChair = await response.json();
      
      // Recarregar os dados com os filtros atuais
      await fetchChairs();
      
      return updatedChair;
    } catch (error) {
      console.error('Erro ao atualizar cadeira:', error);
      throw error;
    }
  }, [fetchChairs]);

  const deleteChair = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/chairs/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir cadeira');
      }

      const result = await response.json();
      
      // Recarregar os dados com os filtros atuais
      await fetchChairs();
      
      return result;
    } catch (error) {
      console.error('Erro ao excluir cadeira:', error);
      throw error;
    }
  }, [fetchChairs]);

  const setFiltersOptimized = useCallback((newFilters: ChairFilters) => {
    setFilters(newFilters);
  }, []);

  return {
    fetchChairs,
    createChair,
    updateChair,
    deleteChair,
    setChairStatus,
    setFilters: setFiltersOptimized,
    chairs,
    pagination,
    chairStatus,
    filters,
    loading,
  };
};