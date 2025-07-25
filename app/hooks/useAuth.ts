"use client";

import { signIn, signOut } from 'next-auth/react';
import { LoginRequest } from '@/app/types/api';

export const useAuth = () => {
  const login = async (loginData: LoginRequest): Promise<boolean> => {
    try {
      const result = await signIn('credentials', {
        username: loginData.username,
        password: loginData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result?.ok || false;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  return {
    login,
    logout,
  };
}; 