"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSetAtom } from 'jotai';
import { userAtom, UserData } from '@/app/atoms/userAtoms';

export const useUserData = () => {
  const { data: session, status } = useSession();
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    if (status === 'loading') return; // Aguarda carregar

    if (status === 'unauthenticated' || !session?.user) {
      setUser(null);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const sessionUser = session.user as {
        id: string;
        username?: string;
        role?: string;
        status?: string;
        name?: string;
      };

      const userData: UserData = {
        id: sessionUser.id,
        username: sessionUser.username || sessionUser.name || '',
        role: (sessionUser.role as UserData['role']) || 'user',
        status: (sessionUser.status as UserData['status']) || 'pending'
      };

      console.log('Sincronizando dados da sessão com userAtom:', userData);
      setUser(userData);
    }
  }, [session, status, setUser]);

  return {
    session,
    status,
    isLoading: status === 'loading'
  };
};