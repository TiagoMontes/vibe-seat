"use client";

import { useState, useCallback } from 'react';
import { useToast } from '@/app/hooks/useToast';
import { handleApiError } from '@/app/lib/apiUtils';

export interface AsyncOperationConfig {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  logErrors?: boolean;
}

export interface AsyncOperationState {
  loading: boolean;
  error: string | null;
  data: unknown;
}

export const useAsyncOperation = <T = unknown>(config: AsyncOperationConfig = {}) => {
  const { success, error: showErrorToast } = useToast();
  
  const [state, setState] = useState<AsyncOperationState>({
    loading: false,
    error: null,
    data: null,
  });

  const {
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast: configShowErrorToast = true,
    logErrors = true,
  } = config;

  const execute = useCallback(async <R = T>(
    operation: () => Promise<R>,
    customConfig?: Partial<AsyncOperationConfig>
  ): Promise<R | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await operation();
      
      setState(prev => ({ ...prev, loading: false, data: result }));
      
      // Show success toast if configured
      if ((customConfig?.showSuccessToast ?? showSuccessToast) && 
          (customConfig?.successMessage || successMessage)) {
        success(customConfig?.successMessage || successMessage!);
      }
      
      return result;
    } catch (error) {
      const errorMsg = handleApiError(error);
      const finalErrorMessage = customConfig?.errorMessage || errorMessage || errorMsg;
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: finalErrorMessage 
      }));
      
      // Log error if configured
      if (customConfig?.logErrors ?? logErrors) {
        console.error('Async operation failed:', error);
      }
      
      // Show error toast if configured
      if (customConfig?.showErrorToast ?? configShowErrorToast) {
        showErrorToast(finalErrorMessage);
      }
      
      return null;
    }
  }, [success, showErrorToast, successMessage, errorMessage, showSuccessToast, configShowErrorToast, logErrors]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null,
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setError,
    setLoading,
  };
};

// Hook especializado para operações CRUD
export const useCrudOperation = (entityName: string) => {
  const createOperation = useAsyncOperation({
    successMessage: `${entityName} criado com sucesso!`,
    errorMessage: `Erro ao criar ${entityName}`,
  });

  const updateOperation = useAsyncOperation({
    successMessage: `${entityName} atualizado com sucesso!`,
    errorMessage: `Erro ao atualizar ${entityName}`,
  });

  const deleteOperation = useAsyncOperation({
    successMessage: `${entityName} excluído com sucesso!`,
    errorMessage: `Erro ao excluir ${entityName}`,
  });

  const fetchOperation = useAsyncOperation({
    errorMessage: `Erro ao buscar ${entityName}`,
    showSuccessToast: false, // Geralmente não mostramos toast para fetch
  });

  return {
    create: createOperation,
    update: updateOperation,
    delete: deleteOperation,
    fetch: fetchOperation,
  };
};