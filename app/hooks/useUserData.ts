"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { userAtom, userNameAtom, userRoleAtom, userIdAtom, isAuthenticatedAtom } from '@/app/atoms/userAtoms';

export function useUserData() {
  const { data: session, status } = useSession();
  const setUser = useSetAtom(userAtom);
  
  const user = useAtomValue(userAtom);
  const userName = useAtomValue(userNameAtom);
  const userRole = useAtomValue(userRoleAtom);
  const userId = useAtomValue(userIdAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  // Sincronizar dados da sessão com o atom
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userData = {
        id: session.user.id || '',
        username: session.user.username || '',
        role: session.user.role || ''
      };

      setUser(userData);
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status, setUser]);

  return {
    user,
    userName,
    userRole,
    userId,
    isAuthenticated,
    session,
    status
  };
} 