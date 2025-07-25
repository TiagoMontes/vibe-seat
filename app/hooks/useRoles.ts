"use client";

import { useCallback } from 'react';
import { RoleListResponse } from '@/app/types/api';

export const useRoles = () => {
  const getRoles = useCallback(async (): Promise<RoleListResponse | null> => {
    try {
      const response = await fetch('/api/roles/getAll');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar roles');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar roles');
      }
      
      return responseData.data;
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      throw error;
    }
  }, []);

  return {
    getRoles,
  };
}; 