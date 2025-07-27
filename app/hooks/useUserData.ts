"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSetAtom } from 'jotai';
import { userAtom, UserData } from '@/app/atoms/userAtoms';

export const useUserData = () => {
  const { data: session, status } = useSession();
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    console.log('useUserData - Status:', status, 'Session:', session?.user);
    
    if (status === 'loading') return; // Aguarda carregar

    if (status === 'unauthenticated' || !session?.user) {
      console.log('useUserData - Usuário não autenticado, limpando userAtom');
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
        id: Number(sessionUser.id),
        username: sessionUser.username || sessionUser.name || '',
        role: (sessionUser.role as UserData['role']) || 'user',
        status: (sessionUser.status as UserData['status']) || 'pending',
        // Valores padrão para campos obrigatórios que não estão na sessão
        fullName: sessionUser.username || sessionUser.name || '',
        cpf: '',
        jobFunction: '',
        position: '',
        registration: '',
        sector: '',
        email: '',
        phone: '',
        gender: 'M',
        birthDate: ''
      };
      
      setUser(userData);
    }
  }, [session, status, setUser]);

  return {
    session,
    status,
    isLoading: status === 'loading'
  };
};