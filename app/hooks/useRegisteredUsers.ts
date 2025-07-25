"use client";

import { useCallback } from 'react';
import { UserListResponse } from '@/app/types/api';

export const useRegisteredUsers = () => {
  const getRegisteredUsers = useCallback(async (): Promise<UserListResponse | null> => {
    try {
      const response = await fetch('/api/users/getAll');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar usuários registrados');
      }

      const data: UserListResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuários registrados:', error);
      throw error;
    }
  }, []);

  return {
    getRegisteredUsers,
  };
}; 