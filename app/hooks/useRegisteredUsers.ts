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

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar usuários registrados');
      }
      
      return responseData.data;
    } catch (error) {
      console.error('Erro ao buscar usuários registrados:', error);
      throw error;
    }
  }, []);

  return {
    getRegisteredUsers,
  };
}; 