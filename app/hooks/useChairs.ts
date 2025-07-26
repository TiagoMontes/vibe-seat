import { useCallback, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { 
  CreateChairRequest, 
  UpdateChairRequest, 
  Chair, 
  Pagination, 
  ChairInsights,
  Filters 
} from '@/app/types/api';
import { useToast } from '@/app/hooks/useToast';
import {
  chairsAtom,
  paginationAtom,
  chairFiltersAtom,
  chairsInsightsAtom,
  chairsLoadingAtom,
  chairCreateLoadingAtom,
  chairUpdateLoadingAtom,
  chairDeleteLoadingAtom,
  incrementChairsUpdateTriggerAtom,
} from '@/app/atoms/chairAtoms';

export const useChairs = () => {
  const { success, error } = useToast();

  // ===== ESTADOS GLOBAIS =====
  const [chairs, setChairs] = useAtom(chairsAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);
  const [filters, setFilters] = useAtom(chairFiltersAtom);
  const [chairsInsights, setChairsInsights] = useAtom(chairsInsightsAtom);
  const [loading, setLoading] = useAtom(chairsLoadingAtom);
  const [createLoading, setCreateLoading] = useAtom(chairCreateLoadingAtom);
  const [updateLoading, setUpdateLoading] = useAtom(chairUpdateLoadingAtom);
  const [deleteLoading, setDeleteLoading] = useAtom(chairDeleteLoadingAtom);
  
  // ===== AÇÕES =====
  const incrementUpdateTrigger = useSetAtom(incrementChairsUpdateTriggerAtom);

  // Usar useRef para manter a referência dos filtros atuais
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // ===== FUNÇÕES PRINCIPAIS =====

  const fetchChairs = useCallback(async (customFilters?: Filters) => {
    setLoading(true);
    try {
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
        throw new Error(errorData.message || 'Erro ao buscar cadeiras');
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
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar cadeiras:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []); // Removido as dependências para evitar loops

  const createChair = useCallback(async (chairData: CreateChairRequest) => {
    setCreateLoading(true);
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
        throw new Error(errorData.message || 'Erro ao criar cadeira');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao criar cadeira');
      }
      
      // Recarregar os dados com os filtros atuais
      await fetchChairs();
      
      // Força atualização global
      incrementUpdateTrigger();
      
      // Toast de sucesso
      success('Cadeira criada com sucesso!');
      
      return responseData.data;
    } catch (err) {
      console.error('Erro ao criar cadeira:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cadeira';
      error(errorMessage);
      throw err;
    } finally {
      setCreateLoading(false);
    }
  }, [fetchChairs, incrementUpdateTrigger, success, error]);

  const updateChair = useCallback(async (id: number, chairData: UpdateChairRequest) => {
    setUpdateLoading(true);
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
        throw new Error(errorData.message || 'Erro ao atualizar cadeira');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao atualizar cadeira');
      }
      
      // Recarregar os dados com os filtros atuais
      await fetchChairs();
      
      // Força atualização global
      incrementUpdateTrigger();
      
      // Toast de sucesso
      success('Cadeira atualizada com sucesso!');
      
      return responseData.data;
    } catch (err) {
      console.error('Erro ao atualizar cadeira:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cadeira';
      error(errorMessage);
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  }, [fetchChairs, incrementUpdateTrigger, success, error]);

  const deleteChair = useCallback(async (id: number) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/chairs/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir cadeira');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao excluir cadeira');
      }
      
      // Recarregar os dados com os filtros atuais
      await fetchChairs();
      
      // Toast de sucesso
      success('Cadeira excluída com sucesso!');
      
      return responseData.data;
    } catch (err) {
      console.error('Erro ao excluir cadeira:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir cadeira';
      error(errorMessage);
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  }, [fetchChairs, success, error]);

  const fetchChairsInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/chairs/insights');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar insights das cadeiras');
      }

      const responseData = await response.json();
      setChairsInsights(responseData.data);
    } catch (err) {
      console.error('Erro ao buscar insights das cadeiras:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar insights das cadeiras';
      error(errorMessage);
    }
  }, [setChairsInsights, error]);

  const setFiltersOptimized = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, [setFilters]);

  return {
    // Estados
    chairs,
    pagination,
    filters,
    chairsInsights,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Funções
    fetchChairs,
    createChair,
    updateChair,
    deleteChair,
    fetchChairsInsights,
    setFilters: setFiltersOptimized,
  };
};