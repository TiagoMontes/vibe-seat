"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { 
  approvalsAtom, 
  approvalsLoadingAtom, 
  approvalsErrorAtom,
  type Approval 
} from '@/app/atoms/userManagementAtoms';

export type ApprovalStatus = 'all' | 'pending' | 'approved' | 'rejected';
export type ApprovalSortBy = 'newest' | 'oldest' | 'user-asc' | 'user-desc';

interface ApprovalFilters {
  page: number;
  limit: number;
  search: string;
  status: ApprovalStatus;
  sortBy: ApprovalSortBy;
}

interface ApprovalPagination {
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

interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface ApprovalResponse {
  approvals: Approval[];
  pagination: ApprovalPagination;
  stats: ApprovalStats;
}

export function useApprovals() {
  const [approvals, setApprovals] = useAtom(approvalsAtom);
  const [loading, setLoading] = useAtom(approvalsLoadingAtom);
  const [error, setError] = useAtom(approvalsErrorAtom);

  const [pagination, setPagination] = useState<ApprovalPagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    lastPage: 1,
  });
  
  const [stats, setStats] = useState<ApprovalStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  
  const [filters, setFilters] = useState<ApprovalFilters>({
    page: 1,
    limit: 9,
    search: '',
    status: 'all',
    sortBy: 'newest',
  });

  // Debounce para search
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  const fetchApprovals = useCallback(async (newFilters?: Partial<ApprovalFilters>) => {
    setLoading(true);
    setError(null);

    try {
      const currentFilters = { ...filters, ...(newFilters || {}) };
      
      // Construir query parameters
      const queryParams = new URLSearchParams();
      queryParams.set('page', currentFilters.page.toString());
      queryParams.set('limit', currentFilters.limit.toString());
      
      // SEMPRE filtrar por status=pending para esta tela
      queryParams.set('status', 'pending');
      
      if (currentFilters.search.trim()) {
        queryParams.set('search', currentFilters.search.trim());
      }
      
      if (currentFilters.sortBy !== 'newest') {
        queryParams.set('sortBy', currentFilters.sortBy);
      }

      const response = await fetch(`/api/approvals/getAll?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar aprovações');
      }

      const data: ApprovalResponse = await response.json();
      
      setApprovals(data.approvals);
      setPagination(data.pagination);
      setStats(data.stats);
      
      // Atualizar filtros se foram passados novos
      if (newFilters) {
        setFilters(prev => ({ ...prev, ...newFilters }));
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, setApprovals, setLoading, setError]);

  const updateApprovalStatus = async (approvalId: number, status: 'approved' | 'rejected'): Promise<boolean> => {
    try {
      const response = await fetch('/api/approvals/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalId,
          status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar aprovação');
      }

      // Recarregar a lista após atualizar
      await fetchApprovals();

      const statusText = status === 'approved' ? 'aprovado' : 'rejeitado';
      toast.success(`Usuário ${statusText} com sucesso!`);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return false;
    }
  };

  // Funções de paginação
  const goToPage = useCallback((page: number) => {
    console.log('goToPage', page);
    fetchApprovals({ page });
  }, [fetchApprovals]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage && pagination.nextPage) {
      fetchApprovals({ page: pagination.nextPage });
    }
  }, [pagination.hasNextPage, pagination.nextPage, fetchApprovals]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage && pagination.prevPage) {
      fetchApprovals({ page: pagination.prevPage });
    }
  }, [pagination.hasPrevPage, pagination.prevPage, fetchApprovals]);

  // Funções de filtro - apenas passam para o backend
  const updateSearch = useCallback((search: string) => {
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Atualizar o filtro local imediatamente para UI responsiva
    setFilters(prev => ({ ...prev, search }));
    
    // Debounce de 500ms para evitar muitas requisições
    searchTimeoutRef.current = setTimeout(() => {
      fetchApprovals({ search, page: 1 }); // Reset para página 1 ao buscar
    }, 500);
  }, [fetchApprovals]);

  const updateStatusFilter = useCallback((status: ApprovalStatus) => {
    fetchApprovals({ status, page: 1 }); // Reset para página 1 ao filtrar
  }, [fetchApprovals]);

  const updateSortBy = useCallback((sortBy: ApprovalSortBy) => {
    fetchApprovals({ sortBy, page: 1 }); // Reset para página 1 ao ordenar
  }, [fetchApprovals]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchApprovals();
    
    // Cleanup do timeout quando componente for desmontado
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []); // Só executa uma vez no mount

  return {
    // Data - retornado pelo backend já filtrado
    approvals,
    pagination,
    stats,
    loading,
    error,
    
    // Filtros atuais
    filters,
    
    // Funções de filtro - passam para o backend
    updateSearch,
    updateStatusFilter,
    updateSortBy,
    
    // Paginação
    goToPage,
    nextPage,
    prevPage,
    
    // Actions
    fetchApprovals,
    updateApprovalStatus,
    
    // Compatibilidade com código existente
    pendingApprovals: approvals.filter(a => a.status === 'pending'),
    pendingCount: stats.pending,
  };
} 