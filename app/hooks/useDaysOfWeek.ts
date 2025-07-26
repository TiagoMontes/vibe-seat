import { useCallback } from 'react';

export const useDaysOfWeek = () => {
  const listDays = useCallback(async (): Promise<{ days: { id: number; name: string; }[] } | null> => {
    try {
      const response = await fetch(`/api/daysOfWeek/getAll`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dias da semana');
      }

      const responseData = await response.json();
      
      // A API retorna { success: true, data: [...], total: number }
      if (responseData.success && responseData.data) {
        return {
          days: responseData.data,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar dias da semana:', error);
      throw error;
    }
  }, []);

  return {
    listDays,
  };
}; 