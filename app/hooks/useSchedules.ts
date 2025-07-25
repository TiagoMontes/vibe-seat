import { useCallback } from 'react';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '@/app/types/api';

export const useSchedules = () => {
  const getSchedule = useCallback(async (id: number): Promise<Schedule | null> => {
    try {
      const response = await fetch(`/api/schedules/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar configuração de horário');
      }

      const data: Schedule = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar configuração de horário:', error);
      throw error;
    }
  }, []);

  const createSchedule = useCallback(async (scheduleData: CreateScheduleRequest) => {
    try {
      const response = await fetch('/api/schedules/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar configuração de horário');
      }

      const newSchedule = await response.json();
      return newSchedule;
    } catch (error) {
      console.error('Erro ao criar configuração de horário:', error);
      throw error;
    }
  }, []);

  const updateSchedule = useCallback(async (id: number, scheduleData: UpdateScheduleRequest) => {
    try {
      const response = await fetch(`/api/schedules/update/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar configuração de horário');
      }

      const updatedSchedule = await response.json();
      return updatedSchedule;
    } catch (error) {
      console.error('Erro ao atualizar configuração de horário:', error);
      throw error;
    }
  }, []);

  const deleteSchedule = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/schedules/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir configuração de horário');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao excluir configuração de horário:', error);
      throw error;
    }
  }, []);

  return {
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}; 