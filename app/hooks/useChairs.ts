import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { chairsAtom, paginationAtom, chairStatsAtom } from '@/app/atoms/chairAtoms';
import { ChairFilters, CreateChairRequest, UpdateChairRequest, ChairListResponse } from '@/app/types/api';

export const useChairs = () => {
  const setChairs = useSetAtom(chairsAtom);
  const setPagination = useSetAtom(paginationAtom);
  const setChairStats = useSetAtom(chairStatsAtom);

  const fetchChairs = useCallback(async (customFilters: ChairFilters) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (customFilters.page) queryParams.set('page', customFilters.page.toString());
      if (customFilters.limit) queryParams.set('limit', customFilters.limit.toString());
      if (customFilters.search) queryParams.set('search', customFilters.search);
      if (customFilters.status) queryParams.set('status', customFilters.status);
      if (customFilters.sortBy) queryParams.set('sortBy', customFilters.sortBy);

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
        itemsPerPage: 9,
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
      setChairStats(stats);
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar cadeiras:', error);
      throw error;
    }
  }, [setChairs, setPagination, setChairStats]);

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
      return newChair;
    } catch (error) {
      console.error('Erro ao criar cadeira:', error);
      throw error;
    }
  }, []);

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
      return updatedChair;
    } catch (error) {
      console.error('Erro ao atualizar cadeira:', error);
      throw error;
    }
  }, []);

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
      return result;
    } catch (error) {
      console.error('Erro ao excluir cadeira:', error);
      throw error;
    }
  }, []);

  return {
    fetchChairs,
    createChair,
    updateChair,
    deleteChair,
  };
}; 