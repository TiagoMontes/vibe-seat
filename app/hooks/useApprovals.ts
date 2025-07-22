"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { 
  approvalsAtom, 
  approvalsLoadingAtom, 
  approvalsErrorAtom,
  pendingCountAtom,
  type Approval 
} from '@/app/atoms/userManagementAtoms';

export type ApprovalStatus = 'all' | 'pending' | 'approved' | 'rejected';

export function useApprovals() {
  const [approvals, setApprovals] = useAtom(approvalsAtom);
  const [loading, setLoading] = useAtom(approvalsLoadingAtom);
  const [error, setError] = useAtom(approvalsErrorAtom);
  const [pendingCount] = useAtom(pendingCountAtom);
  
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([]);
  const [filter, setFilter] = useState<ApprovalStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/approvals/getAll');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar aprovações');
      }

      const data = await response.json();
      setApprovals(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setApprovals, setLoading, setError]);

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

      setApprovals(prev => 
        prev.map(approval => 
          approval.id === approvalId 
            ? { ...approval, status }
            : approval
        )
      );

      const statusText = status === 'approved' ? 'aprovado' : 'rejeitado';
      toast.success(`Usuário ${statusText} com sucesso!`);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    let filtered = approvals;

    if (filter !== 'all') {
      filtered = filtered.filter(approval => approval.status === filter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(approval =>
        approval.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.requestedRole.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApprovals(filtered);
  }, [approvals, filter, searchTerm, fetchApprovals]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  return {
    approvals: filteredApprovals,
    allApprovals: approvals,
    loading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    pendingCount,
    fetchApprovals,
    updateApprovalStatus,
  };
} 