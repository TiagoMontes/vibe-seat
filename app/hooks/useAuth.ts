"use client";

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LoginData {
  username: string;
  password: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    await signOut({ redirect: false });
    router.push('/');
  };

  return {
    user: session?.user,
    session,
    loading: loading || status === 'loading',
    error,
    login,
    logout,
    isAuthenticated: status === 'authenticated',
    status,
  };
} 