"use client";

import { useState, useCallback } from 'react';
import { useToast } from '@/app/hooks/useToast';

export interface ApiCrudConfig<T> {
  baseUrl: string;
  entityName: string;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    fetch?: string;
  };
  errorMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    fetch?: string;
  };
  onSuccess?: (action: 'create' | 'update' | 'delete' | 'fetch', data?: T) => void;
  onError?: (action: 'create' | 'update' | 'delete' | 'fetch', error: string) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export const useApiCrud = <T, CreateRequest = Partial<T>, UpdateRequest = Partial<T>>(
  config: ApiCrudConfig<T>
) => {
  const { success, error: showError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = useCallback((params: QueryParams): string => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.set(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }, []);

  const handleApiCall = useCallback(async <R>(
    apiCall: () => Promise<Response>,
    action: 'create' | 'update' | 'delete' | 'fetch',
    setLoadingState?: (loading: boolean) => void
  ): Promise<R | null> => {
    try {
      setError(null);
      setLoadingState?.(true);
      
      const response = await apiCall();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 
          config.errorMessages?.[action] || 
          `Erro ao ${action === 'fetch' ? 'buscar' : action === 'create' ? 'criar' : action === 'update' ? 'atualizar' : 'excluir'} ${config.entityName}`;
        throw new Error(errorMessage);
      }

      const responseData: ApiResponse<R> = await response.json();
      
      if (!responseData.success) {
        const errorMessage = responseData.message || 
          config.errorMessages?.[action] || 
          `Erro ao ${action === 'fetch' ? 'buscar' : action === 'create' ? 'criar' : action === 'update' ? 'atualizar' : 'excluir'} ${config.entityName}`;
        throw new Error(errorMessage);
      }
      
      // Show success message for CUD operations (not for fetch)
      if (action !== 'fetch') {
        const successMessage = config.successMessages?.[action] || 
          `${config.entityName} ${action === 'create' ? 'criado' : action === 'update' ? 'atualizado' : 'excluído'} com sucesso!`;
        success(successMessage);
      }
      
      // Call success callback
      config.onSuccess?.(action, responseData.data);
      
      return responseData.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Erro desconhecido ao ${action}`;
      console.error(`Erro ao ${action} ${config.entityName}:`, err);
      setError(errorMessage);
      showError(errorMessage);
      config.onError?.(action, errorMessage);
      throw err;
    } finally {
      setLoadingState?.(false);
    }
  }, [config, success, showError]);

  const fetchList = useCallback(async (params: QueryParams = {}): Promise<T | null> => {
    const queryString = buildQueryString(params);
    return handleApiCall<T>(
      () => fetch(`${config.baseUrl}${queryString}`),
      'fetch',
      setLoading
    );
  }, [config.baseUrl, buildQueryString, handleApiCall]);

  const fetchById = useCallback(async (id: number | string): Promise<T | null> => {
    return handleApiCall<T>(
      () => fetch(`${config.baseUrl}/${id}`),
      'fetch',
      setLoading
    );
  }, [config.baseUrl, handleApiCall]);

  const create = useCallback(async (data: CreateRequest): Promise<T | null> => {
    return handleApiCall<T>(
      () => fetch(`${config.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
      'create',
      setCreateLoading
    );
  }, [config.baseUrl, handleApiCall]);

  const update = useCallback(async (id: number | string, data: UpdateRequest): Promise<T | null> => {
    return handleApiCall<T>(
      () => fetch(`${config.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
      'update',
      setUpdateLoading
    );
  }, [config.baseUrl, handleApiCall]);

  const remove = useCallback(async (id: number | string): Promise<T | null> => {
    return handleApiCall<T>(
      () => fetch(`${config.baseUrl}/${id}`, {
        method: 'DELETE',
      }),
      'delete',
      setDeleteLoading
    );
  }, [config.baseUrl, handleApiCall]);

  const customCall = useCallback(async <R>(
    endpoint: string,
    options: RequestInit = {},
    action: 'create' | 'update' | 'delete' | 'fetch' = 'fetch',
    customLoading?: (loading: boolean) => void
  ): Promise<R | null> => {
    return handleApiCall<R>(
      () => fetch(`${config.baseUrl}/${endpoint}`, options),
      action,
      customLoading
    );
  }, [config.baseUrl, handleApiCall]);

  return {
    // Data fetching
    fetchList,
    fetchById,
    
    // CRUD operations
    create,
    update,
    remove,
    
    // Custom API calls
    customCall,
    
    // Loading states
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Error state
    error,
    setError,
    
    // Utility
    buildQueryString,
  };
};