import { useCallback } from 'react';
import { AppointmentListResponse } from '@/app/types/api';

export const useScheduledAppointments = () => {
  const getScheduledAppointments = useCallback(async (): Promise<AppointmentListResponse | null> => {
    try {
      const response = await fetch('/api/appointments/getAll?status=scheduled');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar agendamentos agendados');
      }

      const data: AppointmentListResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos agendados:', error);
      throw error;
    }
  }, []);

  return {
    getScheduledAppointments,
  };
}; 