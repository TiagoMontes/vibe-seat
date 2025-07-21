"use client";

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom, isAuthenticatedAtom, type UserData } from '@/app/atoms/userAtoms';

interface LoginData {
  username: string;
  password: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sincronizar dados da sessão NextAuth com o atom do Jotai
  useEffect(() => {
    if (session?.user && status === 'authenticated') {
      const userData: UserData = {
        id: session.user.id || '',
        username: session.user.username || '',
        role: session.user.role || 'User',
      };
      setUser(userData);
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status, setUser]);

  const login = async (loginData: LoginData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        username: loginData.username,
        password: loginData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return false;
      }

      if (result?.ok) {
        // Redirecionar para a página home após login bem-sucedido
        router.push('/home');
        return true;
      }

      return false;
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null); // Limpar atom antes do signOut
    await signOut({ redirect: false });
    router.push('/');
  };

  return {
    user,
    session,
    loading: loading || status === 'loading',
    error,
    login,
    logout,
    isAuthenticated: isAuthenticated && status === 'authenticated',
    status,
  };
} 