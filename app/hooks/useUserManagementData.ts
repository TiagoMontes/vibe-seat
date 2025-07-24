"use client";

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { 
  registeredUsersAtom, 
  usersLoadingAtom, 
  usersErrorAtom,
  syncUsersWithApprovalsAtom
} from '@/app/atoms/userManagementAtoms';
import { useToast } from './useToast';

// Tipos para paginação
interface UserPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}

interface UserStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface UserFilters {
  page: number;
  limit: number;
  search: string;
  status: string;
  sortBy: string;
}

interface UserResponse {
  users: any[];
  pagination: UserPagination;
  stats: UserStats;
}

export function useUserManagementData() {
  const [, setUsers] = useAtom(registeredUsersAtom);
  const [, setUsersLoading] = useAtom(usersLoadingAtom);
  const [, setUsersError] = useAtom(usersErrorAtom);
  const [, syncUsers] = useAtom(syncUsersWithApprovalsAtom);
  
  const { error: showError } = useToast();
  
  const [pagination, setPagination] = useState<UserPagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    lastPage: 1,
  });
  
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 8,
    search: '',
    status: '',
    sortBy: 'newest',
  });
  
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const fetchUsers = useCallback(async (newFilters?: Partial<UserFilters>) => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const currentFilters = { ...filters, ...(newFilters || {}) };
      
      // Construir query parameters
      const queryParams = new URLSearchParams();
      queryParams.set('page', currentFilters.page.toString());
      queryParams.set('limit', currentFilters.limit.toString());
      
      if (currentFilters.status.trim()) {
        queryParams.set('status', currentFilters.status.trim());
      }
      
      if (currentFilters.search.trim()) {
        queryParams.set('search', currentFilters.search.trim());
      }
      
      if (currentFilters.sortBy !== 'newest') {
        queryParams.set('sortBy', currentFilters.sortBy);
      }

      const response = await fetch(`/api/users/getAll?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar usuários');
      }

      const data: UserResponse = await response.json();
      
      setUsers(data.users);
      setPagination(data.pagination);
      setStats(data.stats);
      
      // Atualizar filtros se foram passados novos
      if (newFilters) {
        setFilters(prev => ({ ...prev, ...newFilters }));
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setUsersError(errorMessage);
      showError(errorMessage);
    } finally {
      setUsersLoading(false);
    }
  }, [filters, setUsers, setUsersLoading, setUsersError]);

  useEffect(() => {
    const loadData = async () => {
      // Evita chamadas duplicadas mesmo em React Strict Mode
      if (hasLoadedRef.current || isLoadingRef.current) {
        return;
      }
      
      isLoadingRef.current = true;

      try {
        await Promise.all([fetchUsers()]);
        syncUsers();
        hasLoadedRef.current = true;
      } catch (error) {
        console.error("useUserManagementData: Erro ao carregar dados:", error);
      } finally {
        isLoadingRef.current = false;
      }
    };
    
    loadData();
  }, []);

  // Funções de paginação
  const goToPage = useCallback((page: number) => {
    fetchUsers({ page });
  }, [fetchUsers]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage && pagination.nextPage) {
      fetchUsers({ page: pagination.nextPage });
    }
  }, [pagination.hasNextPage, pagination.nextPage, fetchUsers]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage && pagination.prevPage) {
      fetchUsers({ page: pagination.prevPage });
    }
  }, [pagination.hasPrevPage, pagination.prevPage, fetchUsers]);

  // Funções de filtro
  const updateSearch = useCallback((search: string) => {
    fetchUsers({ search, page: 1 }); // Reset para página 1 ao buscar
  }, [fetchUsers]);

  const updateStatusFilter = useCallback((status: string) => {
    fetchUsers({ status, page: 1 }); // Reset para página 1 ao filtrar
  }, [fetchUsers]);

  const updateSortBy = useCallback((sortBy: string) => {
    fetchUsers({ sortBy, page: 1 }); // Reset para página 1 ao ordenar
  }, [fetchUsers]);

  const resetData = useCallback(() => {
    hasLoadedRef.current = false;
    isLoadingRef.current = false;
  }, []);

  return {
    fetchUsers,
    pagination,
    stats,
    filters,
    updateSearch,
    updateStatusFilter,
    updateSortBy,
    goToPage,
    nextPage,
    prevPage,
    resetData
  };
} 