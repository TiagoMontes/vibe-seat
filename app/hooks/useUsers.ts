"use client";

import { useCallback } from 'react';
import { CreateUserRequest, UserListResponse, UserFilters } from '@/app/types/api';

export const useUsers = () => {
  const createUser = useCallback(async (userData: CreateUserRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }

      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return false;
    }
  }, []);

  const listUsers = useCallback(async (filters: UserFilters = {}): Promise<UserListResponse | null> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.set('page', filters.page.toString());
      if (filters.limit) queryParams.set('limit', filters.limit.toString());
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.roleId) queryParams.set('roleId', filters.roleId.toString());
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);

      const response = await fetch(`/api/users/getAll?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar usuários');
      }

      const data: UserListResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return null;
    }
  }, []);

  const getUser = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/users/getAll?id=${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar usuário');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }, []);

  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/getAll?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir usuário');
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return false;
    }
  }, []);

  return {
    createUser,
    listUsers,
    getUser,
    deleteUser,
  };
}; 