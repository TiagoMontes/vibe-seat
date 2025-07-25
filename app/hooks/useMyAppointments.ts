import { useCallback } from 'react';
import { MyAppointmentsResponse } from '@/app/types/api';

export const useMyAppointments = () => {
  const getMyAppointments = useCallback(async (): Promise<MyAppointmentsResponse | null> => {
    try {
      const response = await fetch('/api/appointments/my-appointments');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar meus agendamentos');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar meus agendamentos');
      }
      
      return responseData.data;
    } catch (error) {
      console.error('Erro ao buscar meus agendamentos:', error);
      throw error;
    }
  }, []);

  return {
    getMyAppointments,
  };
}; 