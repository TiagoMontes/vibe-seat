import { useCallback, useState, useRef } from 'react';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest, ScheduleFilters } from '@/app/types/api';

export const useSchedules = () => {
  const [schedule, setSchedule] = useState<Schedule | undefined>();
  const [loading, setLoading] = useState(false);

  const fetchSchedules = useCallback(async (customFilters?: ScheduleFilters) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/schedules/getAll`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar configurações de horário');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar configurações de horário');
      }
      
      setSchedule(responseData.data);
      
      return responseData.data;
    } catch (error) {
      console.error('Erro ao buscar configurações de horário:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []); // Removido as dependências para evitar loops

  const fetchSchedule = useCallback(async (id: number): Promise<Schedule | null> => {
    try {
      const response = await fetch(`/api/schedules/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar configuração de horário');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar configuração de horário');
      }
      
      return responseData.data;
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

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao criar configuração de horário');
      }
      
      // Recarregar os dados com os filtros atuais
      await fetchSchedules();
      
      return responseData.data;
    } catch (error) {
      console.error('Erro ao criar configuração de horário:', error);
      throw error;
    }
  }, [fetchSchedules]);

  const updateSchedule = useCallback(async (scheduleData: UpdateScheduleRequest) => {
    try {
      const response = await fetch(`/api/schedules/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erro ao atualizar configuração de horário');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao atualizar configuração de horário');
      }

      // Recarregar os dados com os filtros atuais
      await fetchSchedules();
      
      return responseData.data;
    } catch (error) {
      console.error('Erro ao atualizar configuração de horário:', error);
      throw error;
    }
  }, [fetchSchedules]);

  const deleteSchedule = useCallback(async () => {
    try {
      const response = await fetch(`/api/schedules/delete`, {
        method: 'DELETE',
        redirect: 'follow',
      });
  
      const responseData = await response.json();
  
      if (!response.ok || !responseData.success) {
        const message = typeof responseData.message === 'string'
          ? responseData.message
          : 'Erro ao excluir configuração de horário';
        throw new Error(message);
      }
  
      // Limpar o schedule atual após deletar
      setSchedule(undefined);
      return responseData.data;
    } catch (error) {
      console.error('Erro ao excluir configuração de horário:', error);
      throw error;
    }
  }, []);

  return {
    fetchSchedules,
    fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    schedule,
    loading,
  };
}; 