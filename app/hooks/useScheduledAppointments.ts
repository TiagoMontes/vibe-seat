import { useCallback } from 'react';
import { AppointmentListResponse } from '@/app/types/api';

export const useScheduledAppointments = () => {
  const getScheduledAppointments = useCallback(async (): Promise<AppointmentListResponse | null> => {
    try {
      const response = await fetch('/api/appointments/getAll?status=scheduled');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar agendamentos agendados');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar agendamentos agendados');
      }
      
      return responseData.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos agendados:', error);
      throw error;
    }
  }, []);

  return {
    getScheduledAppointments,
  };
}; 