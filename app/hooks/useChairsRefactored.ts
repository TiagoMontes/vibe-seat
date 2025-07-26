"use client";

import { useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useApiCrud, ApiCrudConfig } from '@/app/hooks/useApiCrud';
import { useCrudOperation } from '@/app/hooks/useAsyncOperation';
import { createApiCall, buildQueryString } from '@/app/lib/apiUtils';
import { 
  CreateChairRequest, 
  UpdateChairRequest, 
  Chair, 
  ChairInsights,
  Filters 
} from '@/app/types/api';
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

// Exemplo de como refatorar useChairs usando os novos utilitários
export const useChairsRefactored = () => {
  // Estados globais do Jotai
  const [chairs, setChairs] = useAtom(chairsAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);
  const [filters, setFilters] = useAtom(chairFiltersAtom);
  const [chairsInsights, setChairsInsights] = useAtom(chairsInsightsAtom);
  const [loading, setLoading] = useAtom(chairsLoadingAtom);
  const [createLoading, setCreateLoading] = useAtom(chairCreateLoadingAtom);
  const [updateLoading, setUpdateLoading] = useAtom(chairUpdateLoadingAtom);
  const [deleteLoading, setDeleteLoading] = useAtom(chairDeleteLoadingAtom);
  
  const incrementUpdateTrigger = useSetAtom(incrementChairsUpdateTriggerAtom);

  // Configuração do hook de CRUD genérico
  const crudConfig: ApiCrudConfig<Chair> = {
    baseUrl: '/api/chairs',
    entityName: 'cadeira',
    successMessages: {
      create: 'Cadeira criada com sucesso!',
      update: 'Cadeira atualizada com sucesso!',
      delete: 'Cadeira excluída com sucesso!',
    },
    onSuccess: (action) => {
      if (action !== 'fetch') {
        incrementUpdateTrigger();
      }
    },
  };

  // Hook de CRUD operações especializadas
  const crudOperations = useCrudOperation('cadeira');

  // Hook de API CRUD genérico
  const apiCrud = useApiCrud<Chair, CreateChairRequest, UpdateChairRequest>(crudConfig);

  // Função para buscar cadeiras (refatorada usando utilitários)
  const fetchChairs = useCallback(async (customFilters?: Filters) => {
    return crudOperations.fetch.execute(async () => {
      setLoading(true);
      try {
        const currentFilters = customFilters || filters;
        const queryString = buildQueryString(currentFilters);
        
        const data = await createApiCall<{ chairs: Chair[], pagination: any }>(
          `/api/chairs/getAll${queryString}`
        );
        
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
      } finally {
        setLoading(false);
      }
    });
  }, [filters, setChairs, setPagination, setLoading, crudOperations.fetch]);

  // Função para criar cadeira (usando hook genérico)
  const createChair = useCallback(async (chairData: CreateChairRequest) => {
    return crudOperations.create.execute(async () => {
      setCreateLoading(true);
      try {
        const result = await apiCrud.create(chairData);
        await fetchChairs(); // Recarregar dados
        return result;
      } finally {
        setCreateLoading(false);
      }
    });
  }, [apiCrud, fetchChairs, setCreateLoading, crudOperations.create]);

  // Função para atualizar cadeira (usando hook genérico)
  const updateChair = useCallback(async (id: number, chairData: UpdateChairRequest) => {
    return crudOperations.update.execute(async () => {
      setUpdateLoading(true);
      try {
        const result = await apiCrud.update(id, chairData);
        await fetchChairs(); // Recarregar dados
        return result;
      } finally {
        setUpdateLoading(false);
      }
    });
  }, [apiCrud, fetchChairs, setUpdateLoading, crudOperations.update]);

  // Função para excluir cadeira (usando hook genérico)
  const deleteChair = useCallback(async (id: number) => {
    return crudOperations.delete.execute(async () => {
      setDeleteLoading(true);
      try {
        const result = await apiCrud.remove(id);
        await fetchChairs(); // Recarregar dados
        return result;
      } finally {
        setDeleteLoading(false);
      }
    });
  }, [apiCrud, fetchChairs, setDeleteLoading, crudOperations.delete]);

  // Função para buscar insights (usando utilitário de API)
  const fetchChairsInsights = useCallback(async () => {
    return crudOperations.fetch.execute(async () => {
      const insights = await createApiCall<ChairInsights>('/api/chairs/insights');
      setChairsInsights(insights);
      return insights;
    }, {
      showSuccessToast: false, // Não mostrar toast para insights
      errorMessage: 'Erro ao buscar insights das cadeiras',
    });
  }, [setChairsInsights, crudOperations.fetch]);

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
    
    // Funções refatoradas
    fetchChairs,
    createChair,
    updateChair,
    deleteChair,
    fetchChairsInsights,
    setFilters,
    
    // Erros dos hooks especializados
    fetchError: crudOperations.fetch.error,
    createError: crudOperations.create.error,
    updateError: crudOperations.update.error,
    deleteError: crudOperations.delete.error,
    
    // Utilitários do hook genérico
    buildQueryString: apiCrud.buildQueryString,
    customApiCall: apiCrud.customCall,
  };
};