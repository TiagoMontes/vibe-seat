import { useCallback, useState } from 'react';
import { DashboardResponse } from '@/app/types/api';
import { useUserData } from '@/app/hooks/useUserData';

export const useDashboard = () => {
  const { user } = useUserData();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const isAdmin = user && user.role === 'admin';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getDashboard = useCallback(async (): Promise<DashboardResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar dados do dashboard');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar dados do dashboard');
      }
      
      setData(responseData.data);
      return responseData.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getDashboard,
    isAdmin,
    loading,
    error,
    data
  };
}; 