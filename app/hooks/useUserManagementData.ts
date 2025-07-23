"use client";

import { useEffect, useCallback, useRef } from 'react';
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
  
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const fetchApprovals = useCallback(async () => {
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
  }, [setApprovals, setApprovalsLoading, setApprovalsError]);

  const fetchUsers = useCallback(async () => {
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
  }, [setUsers, setUsersLoading, setUsersError]);

  useEffect(() => {
    const loadData = async () => {
      // Evita chamadas duplicadas mesmo em React Strict Mode
      if (hasLoadedRef.current || isLoadingRef.current) {
        return;
      }
      
      isLoadingRef.current = true;

      try {
        await Promise.all([fetchApprovals(), fetchUsers()]);
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

  const resetData = useCallback(() => {
    hasLoadedRef.current = false;
    isLoadingRef.current = false;
  }, []);

  return {
    fetchApprovals,
    fetchUsers,
    resetData
  };
} 