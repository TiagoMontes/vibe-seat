"use client";

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { 
  approvalsAtom, 
  approvalsLoadingAtom, 
  approvalsErrorAtom,
  registeredUsersAtom, 
  usersLoadingAtom, 
  usersErrorAtom,
  syncUsersWithApprovalsAtom
} from '@/app/atoms/userManagementAtoms';

export function useUserManagementData() {
  const [, setApprovals] = useAtom(approvalsAtom);
  const [, setApprovalsLoading] = useAtom(approvalsLoadingAtom);
  const [, setApprovalsError] = useAtom(approvalsErrorAtom);
  
  const [, setUsers] = useAtom(registeredUsersAtom);
  const [, setUsersLoading] = useAtom(usersLoadingAtom);
  const [, setUsersError] = useAtom(usersErrorAtom);
  const [, syncUsers] = useAtom(syncUsersWithApprovalsAtom);

  const fetchApprovals = async () => {
    setApprovalsLoading(true);
    setApprovalsError(null);

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
      setApprovalsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setApprovalsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);

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
      setUsersError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchApprovals(), fetchUsers()]);
      // Sincronizar dados após carregar
      syncUsers(null);
    };
    
    loadData();
  }, []);

  return {
    fetchApprovals,
    fetchUsers
  };
} 