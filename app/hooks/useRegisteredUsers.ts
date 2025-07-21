"use client";

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { 
  registeredUsersAtom, 
  usersLoadingAtom, 
  usersErrorAtom,
  totalUsersCountAtom,
  type RegisteredUser 
} from '@/app/atoms/userManagementAtoms';

export function useRegisteredUsers() {
  const [users, setUsers] = useAtom(registeredUsersAtom);
  const [loading, setLoading] = useAtom(usersLoadingAtom);
  const [error, setError] = useAtom(usersErrorAtom);
  const [totalCount] = useAtom(totalUsersCountAtom);
  
  const [filteredUsers, setFilteredUsers] = useState<RegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
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
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários baseado no termo de busca
  useEffect(() => {
    let filtered = [...users];

    // Filtrar por termo de busca
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
  }, []);

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