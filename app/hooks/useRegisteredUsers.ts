"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { 
  registeredUsersAtom, 
  usersLoadingAtom, 
  usersErrorAtom,
  totalUsersCountAtom,
  type RegisteredUser 
} from '@/app/atoms/userManagementAtoms';
import { useToast } from './useToast';

export function useRegisteredUsers() {
  const [users, setUsers] = useAtom(registeredUsersAtom);
  const [loading, setLoading] = useAtom(usersLoadingAtom);
  const [error, setError] = useAtom(usersErrorAtom);
  const [totalCount] = useAtom(totalUsersCountAtom);
  const { error: showError } = useToast();
  
  const [filteredUsers, setFilteredUsers] = useState<RegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/getAll');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar usuários');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setUsers, setLoading, setError]);

  useEffect(() => {
    let filtered = [...users];

    if (searchTerm.trim()) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role?.name && user.role.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: filteredUsers,
    allUsers: users,
    totalCount,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchUsers,
  };
} 