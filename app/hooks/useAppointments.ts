import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { appointmentsAtom, appointmentPaginationAtom } from '@/app/atoms/appointmentAtoms';
import { AppointmentFilters, CreateAppointmentRequest, AppointmentListResponse, AvailableTimesResponse } from '@/app/types/api';

export const useAppointments = () => {
  const setAppointments = useSetAtom(appointmentsAtom);
  const setPagination = useSetAtom(appointmentPaginationAtom);

  const fetchAppointments = useCallback(async () => {
    try {
      const filters: AppointmentFilters = {
        page: 1,
        limit: 10,
        status: "SCHEDULED",
      };

      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.set('page', filters.page.toString());
      if (filters.limit) queryParams.set('limit', filters.limit.toString());
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);

      const response = await fetch(`/api/appointments/getAll?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar agendamentos');
      }

      const data: AppointmentListResponse = await response.json();
      
      setAppointments(data.appointments || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        lastPage: 1,
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }
  }, [setAppointments, setPagination]);

  const fetchAvailableTimes = useCallback(async (date: string, page?: number, limit?: number) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('date', date);
      if (page) queryParams.set('page', page.toString());
      if (limit) queryParams.set('limit', limit.toString());

      const response = await fetch(`/api/appointments/available-times?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar horários disponíveis');
      }

      const data: AvailableTimesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      throw error;
    }
  }, []);

  const createAppointment = useCallback(async (input: CreateAppointmentRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar agendamento');
      }

      return true;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }, []);

  const cancelAppointment = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/appointments/cancel/${id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cancelar agendamento');
      }

      const updatedAppointment = await response.json();
      return updatedAppointment;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  }, []);

  const confirmAppointment = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/appointments/confirm/${id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao confirmar agendamento');
      }

      const updatedAppointment = await response.json();
      return updatedAppointment;
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      throw error;
    }
  }, []);

  return {
    fetchAppointments,
    fetchAvailableTimes,
    createAppointment,
    cancelAppointment,
    confirmAppointment,
  };
}; 