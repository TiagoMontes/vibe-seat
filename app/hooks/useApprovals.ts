"use client";

import { useCallback, useState } from 'react';
import { ApprovalListResponse, ApprovalFilters, UpdateApprovalRequest, Approval, Pagination, UserStats } from '@/app/types/api';

export const useApprovals = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
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
  const [filters, setFilters] = useState<ApprovalFilters>({
    page: 1,
    limit: 10,
    search: "",
    status: "pending",
    sortBy: "newest",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const listApprovals = useCallback(async (filters: ApprovalFilters = {}): Promise<ApprovalListResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.set('page', filters.page.toString());
      if (filters.limit) queryParams.set('limit', filters.limit.toString());
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);

      const response = await fetch(`/api/approvals/getAll?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar aprovações');
      }

      const data: ApprovalListResponse = await response.json();
      setApprovals(data.approvals);
      setPagination(data.pagination);
      setStats(data.stats);
      return data;
    } catch (error) {
      console.error('Erro ao buscar aprovações:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPendingApprovals = useCallback(async (): Promise<ApprovalListResponse | null> => {
    return listApprovals({ status: 'pending' });
  }, [listApprovals]);

  const getApproval = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/approvals/getAll?id=${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar aprovação');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar aprovação:', error);
      throw error;
    }
  }, []);

  const updateApproval = useCallback(async (id: number, updateData: UpdateApprovalRequest) => {
    try {
      const response = await fetch('/api/approvals/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalId: id,
          ...updateData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar aprovação');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar aprovação:', error);
      throw error;
    }
  }, []);

  return {
    listApprovals,
    getPendingApprovals,
    getApproval,
    updateApproval,
    approvals,
    pagination,
    stats,
    filters,
    loading,
    error,
    setFilters,
  };
}; 