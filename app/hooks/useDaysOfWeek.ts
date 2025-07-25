import { useCallback } from 'react';
import { DayListResponse, DayFilters, CreateDayRequest, UpdateDayRequest, DeleteDaysRequest } from '@/app/types/api';

export const useDaysOfWeek = () => {
  const listDays = useCallback(async (filters: DayFilters = {}): Promise<DayListResponse | null> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.set('page', filters.page.toString());
      if (filters.limit) queryParams.set('limit', filters.limit.toString());
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);

      const response = await fetch(`/api/schedules/getAll?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dias da semana');
      }

      const data: DayListResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dias da semana:', error);
      throw error;
    }
  }, []);

  const createDay = useCallback(async (dayData: CreateDayRequest) => {
    try {
      const response = await fetch('/api/schedules/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dayData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar dia da semana');
      }

      const newDay = await response.json();
      return newDay;
    } catch (error) {
      console.error('Erro ao criar dia da semana:', error);
      throw error;
    }
  }, []);

  const getDay = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/schedules/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dia da semana');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dia da semana:', error);
      throw error;
    }
  }, []);

  const updateDay = useCallback(async (id: number, dayData: UpdateDayRequest) => {
    try {
      const response = await fetch(`/api/schedules/update/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dayData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar dia da semana');
      }

      const updatedDay = await response.json();
      return updatedDay;
    } catch (error) {
      console.error('Erro ao atualizar dia da semana:', error);
      throw error;
    }
  }, []);

  const deleteDay = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/schedules/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir dia da semana');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao excluir dia da semana:', error);
      throw error;
    }
  }, []);

  const deleteDays = useCallback(async (deleteData: DeleteDaysRequest) => {
    try {
      const response = await fetch('/api/schedules/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir dias da semana');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao excluir dias da semana:', error);
      throw error;
    }
  }, []);

  return {
    listDays,
    createDay,
    getDay,
    updateDay,
    deleteDay,
    deleteDays,
  };
}; 