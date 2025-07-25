import { useCallback } from 'react';
import { DashboardResponse } from '@/app/types/api';

export const useDashboard = () => {
  const getDashboard = useCallback(async (): Promise<DashboardResponse | null> => {
    try {
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dados do dashboard');
      }

      const data: DashboardResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }, []);

  return {
    getDashboard,
  };
}; 