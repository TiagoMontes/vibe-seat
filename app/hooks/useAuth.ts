import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { LoginZodFormData } from '@/app/schemas/loginSchema';

interface LoginResult {
  success: boolean;
  error?: string;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async (credentials: LoginZodFormData): Promise<LoginResult> => {
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false, // Importante: não redirecionar automaticamente
      });

      if (result?.error) {
        console.error('Login error:', result.error);
        return {
          success: false,
          error: result.error === 'CredentialsSignin' 
            ? 'Credenciais inválidas' 
            : result.error
        };
      }

      if (result?.ok) {
        // Pequeno delay para garantir que a sessão seja atualizada
        setTimeout(() => {
          router.push('/home'); // ou sua rota pós-login
        }, 100);
        
        return { success: true };
      }
      
      return {
        success: false,
        error: 'Erro desconhecido durante o login'
      };

    } catch (error) {
      console.error('Login catch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado'
      };
    }
  };

  const logout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    login,
    logout,
    setLoading,
    loading,
    session,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
};