"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export interface User {
  id: number;
  username: string;
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  roleId: number;
}

export interface Role {
  id: number;
  name: string;
}

export interface Approval {
  id: number;
  userId: number;
  requestedRoleId: number;
  approvedById: number | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: User;
  requestedRole: Role;
}

export type ApprovalStatus = 'all' | 'pending' | 'approved' | 'rejected';

export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApprovalStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApprovals = async () => {
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
  };

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

      // Atualizar o approval na lista local
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

  // Filtrar aprovações baseado no filtro e termo de busca
  useEffect(() => {
    let filtered = approvals;

    // Filtrar por status
    if (filter !== 'all') {
      filtered = filtered.filter(approval => approval.status === filter);
    }

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(approval =>
        approval.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.requestedRole.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApprovals(filtered);
  }, [approvals, filter, searchTerm]);

  useEffect(() => {
    fetchApprovals();
  }, []);

  // Contar aprovações pendentes
  const pendingCount = approvals.filter(approval => approval.status === 'pending').length;

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