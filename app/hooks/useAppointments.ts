import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { 
  appointmentsAtom, 
  myAppointmentsAtom, 
  appointmentPaginationAtom,
  myAppointmentPaginationAtom,
  myAppointmentsLoadingAtom,
  appointmentsLoadingAtom
} from '@/app/atoms/appointmentAtoms';
import { AppointmentFilters, CreateAppointmentRequest } from '@/app/types/api';

export const useAppointments = () => {
  const setAppointments = useSetAtom(appointmentsAtom);
  const setMyAppointments = useSetAtom(myAppointmentsAtom);
  const setPagination = useSetAtom(appointmentPaginationAtom);
  const setMyPagination = useSetAtom(myAppointmentPaginationAtom);
  const setMyLoading = useSetAtom(myAppointmentsLoadingAtom);
  const setLoading = useSetAtom(appointmentsLoadingAtom);

  const fetchAppointments = useCallback(async (customFilters?: Partial<AppointmentFilters>) => {
    setLoading(true);
    try {
      const filters: AppointmentFilters = {
        page: 1,
        limit: 6,
        status: "SCHEDULED", // Padrão para admin: mostrar apenas agendamentos pendentes
        ...customFilters,
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
        throw new Error(errorData.message || 'Erro ao buscar agendamentos');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar agendamentos');
      }
      
      const data = responseData.data;
      
      setAppointments(data.appointments || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
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
    } finally {
      setLoading(false);
    }
  }, [setAppointments, setPagination, setLoading]);

  const fetchMyAppointments = useCallback(async (customFilters?: Partial<AppointmentFilters>) => {
    setMyLoading(true);
    try {
      const filters: AppointmentFilters = {
        page: 1,
        limit: 6,
        status: "all",
        ...customFilters,
      };

      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.set('page', filters.page.toString());
      if (filters.limit) queryParams.set('limit', filters.limit.toString());
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);

      const response = await fetch(`/api/appointments/my-appointments?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar meus agendamentos');
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar meus agendamentos');
      }
      
      const data = responseData.data;
      
      setMyAppointments(data.appointments || []);
      setMyPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        lastPage: 1,
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar meus agendamentos:', error);
      throw error;
    } finally {
      setMyLoading(false);
    }
  }, [setMyAppointments, setMyPagination, setMyLoading]);

  const fetchAvailableTimes = useCallback(async (date: string, chairIds?: number[], page?: number, limit?: number) => {
    try {
      // Build query string for pagination parameters
      const queryParams = new URLSearchParams();
      queryParams.set('date', date);
      if (page) queryParams.set('page', page.toString());
      if (limit) queryParams.set('limit', limit.toString());

      const response = await fetch(`/api/appointments/available-times?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chairIds }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar horários disponíveis');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao buscar horários disponíveis');
      }
      
      return responseData.data;
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
        throw new Error(errorData.message || 'Erro ao cancelar agendamento');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao cancelar agendamento');
      }
      
      return responseData.data;
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
        throw new Error(errorData.message || 'Erro ao confirmar agendamento');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Erro ao confirmar agendamento');
      }
      
      return responseData.data;
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      throw error;
    }
  }, []);

  return {
    fetchAppointments,
    fetchMyAppointments,
    fetchAvailableTimes,
    createAppointment,
    cancelAppointment,
    confirmAppointment,
  };
}; 