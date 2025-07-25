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
        throw new Error(errorData.error || 'Erro ao buscar dados do dashboard');
      }

      const data: DashboardResponse = await response.json();
      console.log(data)
      setData(data);
      return data;
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