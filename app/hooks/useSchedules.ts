import { useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '@/app/types/api';
import { useToast } from '@/app/hooks/useToast';
import {
  currentScheduleAtom,
  schedulesLoadingAtom,
  scheduleCreateLoadingAtom,
  scheduleUpdateLoadingAtom,
  scheduleDeleteLoadingAtom,
  incrementSchedulesUpdateTriggerAtom,
} from '@/app/atoms/scheduleAtoms';

export const useSchedules = () => {
  const { success, error } = useToast();

  // ===== ESTADOS GLOBAIS =====
  const [schedule, setSchedule] = useAtom(currentScheduleAtom);
  const [loading, setLoading] = useAtom(schedulesLoadingAtom);
  const [createLoading, setCreateLoading] = useAtom(scheduleCreateLoadingAtom);
  const [updateLoading, setUpdateLoading] = useAtom(scheduleUpdateLoadingAtom);
  const [deleteLoading, setDeleteLoading] = useAtom(scheduleDeleteLoadingAtom);
  
  // ===== AÇÕES =====
  const incrementUpdateTrigger = useSetAtom(incrementSchedulesUpdateTriggerAtom);

  // ===== FUNÇÕES PRINCIPAIS =====

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/schedules/getAll`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar configurações de horário');
      }

      const responseData = await response.json();
      
      // Verificar se a resposta tem a estrutura esperada
      const schedules = responseData.data.data || responseData;
      
      setSchedule(schedules);
      
      return schedules;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      return responseData.data.data;
    } catch (error) {
      console.error('Erro ao buscar configuração de horário:', error);
      throw error;
    }
  }, []);

  const createSchedule = useCallback(async (scheduleData: CreateScheduleRequest) => {
    setCreateLoading(true);
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
        
        // Extrair a mensagem de erro mais específica
        const errorMessage = errorData.error || errorData.message || 'Erro ao criar configuração de horário';
        const errorDetails = errorData.details ? `\nDetalhes: ${JSON.stringify(errorData.details, null, 2)}` : '';
        
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      const responseData = await response.json();
      
      // Verificar se a resposta tem a estrutura esperada
      const createdSchedule = responseData.data.data || responseData;
      
      // Update the state immediately with the created schedule data
      setSchedule(createdSchedule);
      
      // Força atualização global
      incrementUpdateTrigger();
      
      // Toast de sucesso
      success('Configuração criada com sucesso!');
      
      return createdSchedule;
    } catch (error) {
      throw error;
    } finally {
      setCreateLoading(false);
    }
  }, [setSchedule, incrementUpdateTrigger, success, setCreateLoading]);

  const updateSchedule = useCallback(async (scheduleData: UpdateScheduleRequest, id: number) => {
    setUpdateLoading(true);
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
        
        // Extrair a mensagem de erro mais específica
        const errorMessage = errorData.error || errorData.message || 'Erro ao atualizar configuração de horário';
        const errorDetails = errorData.details ? `\nDetalhes: ${JSON.stringify(errorData.details, null, 2)}` : '';
        
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      const responseData = await response.json();
      
      // Verificar se a resposta tem a estrutura esperada
      const updatedSchedule = responseData.data.data || responseData;

      // Update the state immediately with the updated schedule data
      setSchedule(updatedSchedule);
      
      // Força atualização global
      incrementUpdateTrigger();
      
      // Toast de sucesso
      success('Configuração atualizada com sucesso!');
      
      return updatedSchedule;
    } catch (error) {
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  }, [setSchedule, incrementUpdateTrigger, success, setUpdateLoading]);

  const deleteSchedule = useCallback(async (id: number) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/schedules/delete/${id}`, {
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
      
      // Toast de sucesso - só mostra se chegou até aqui (sucesso confirmado)
      success('Configuração excluída com sucesso!');
      
      return responseData.data?.data || null;
    } catch (err) {
      // Mostrar toast de erro
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir configuração';
      error(errorMessage);
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  }, [setSchedule, success, error, setDeleteLoading]);

  return {
    // Estados
    schedule,
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Funções
    fetchSchedules,
    fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}; 