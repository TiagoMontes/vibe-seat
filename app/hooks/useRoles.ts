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

      const data: RoleListResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      throw error;
    }
  }, []);

  return {
    getRoles,
  };
}; 