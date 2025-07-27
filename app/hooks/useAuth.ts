"use client";

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/atoms/userAtoms';
import { LoginRequest } from '@/app/types/api';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const setUser = useSetAtom(userAtom);

  const login = async (loginData: LoginRequest): Promise<{ success: boolean; user?: { id: number; username: string; role: string; } }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn('credentials', {
        username: loginData.username,
        password: loginData.password,
        redirect: false,
      });

      if (result?.error) {
        let errorMessage = 'Erro de autenticação';
        
        // Handle specific error types
        if (result.error.includes('CLIENT_FETCH_ERROR')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão.';
        } else if (result.error.includes('CredentialsSignin')) {
          errorMessage = 'Credenciais inválidas';
        } else if (result.error.includes('JSON')) {
          errorMessage = 'Erro de comunicação com o servidor';
        } else {
          errorMessage = result.error;
        }
        
        toast.error(errorMessage);
        setError(errorMessage);
        return { success: false };
      }

      if (!result?.ok) {
        const errorMessage = 'Falha na autenticação';
        toast.error(errorMessage);
        setError(errorMessage);
        return { success: false };
      }

      // Se chegou aqui, o login foi bem-sucedido
      toast.success('Login realizado com sucesso!');
      // O useUserData irá sincronizar automaticamente os dados da sessão
      router.push('/home');

      return { 
        success: true, 
        user: session?.user ? {
          id: Number(session.user.id),
          username: session.user.username || '',
          role: session.user.role || ''
        } : undefined
      };
      
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      setUser(null); // Limpar dados do usuário
      toast.success('Logout realizado com sucesso!');
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('Erro no logout:', error);
      const errorMessage = 'Erro ao fazer logout';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    loading,
    error,
    clearError: () => setError(null),
    user: session?.user,
    isAuthenticated: !!session?.user
  };
};