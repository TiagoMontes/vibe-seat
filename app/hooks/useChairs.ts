import { useCallback, useState, useRef } from 'react';
import { Filters, CreateChairRequest, UpdateChairRequest, ChairListResponse, Chair, Pagination } from '@/app/types/api';

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
  const [filters, setFilters] = useState<Filters>({
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

  const fetchChairs = useCallback(async (customFilters?: Filters) => {
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

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar cadeiras');
      }
      
      const data = responseData.data;
      
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
        active: data.chairs?.filter((chair: any) => chair.status === "ACTIVE").length || 0,
        maintenance: data.chairs?.filter((chair: any) => chair.status === "MAINTENANCE").length || 0,
        inactive: data.chairs?.filter((chair: any) => chair.status === "INACTIVE").length || 0,
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

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao criar cadeira');
      }
      
      // Recarregar os dados com os filtros atuais
      await fetchChairs();
      
      return responseData.data;
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

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao atualizar cadeira');
      }
      
      // Recarregar os dados com os filtros atuais
      await fetchChairs();
      
      return responseData.data;
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

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao excluir cadeira');
      }
      
      // Recarregar os dados com os filtros atuais
      await fetchChairs();
      
      return responseData.data;
    } catch (error) {
      console.error('Erro ao excluir cadeira:', error);
      throw error;
    }
  }, [fetchChairs]);

  const setFiltersOptimized = useCallback((newFilters: Filters) => {
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