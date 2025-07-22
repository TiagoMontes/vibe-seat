import { useCallback } from "react";
import { useAtom } from "jotai";
import { 
  appointmentsAtom, 
  appointmentPaginationAtom, 
  appointmentFiltersAtom,
  appointmentsLoadingAtom,
  appointmentCreateLoadingAtom,
  appointmentCancelLoadingAtom,
  appointmentConfirmLoadingAtom,
  availableTimesLoadingAtom,
  availableTimesAtom,
  selectedChairIdAtom,
  selectedDateAtom,
  selectedTimeAtom,
  appointmentErrorAtom,
  appointmentSuccessMessageAtom,
  appointmentModalOpenAtom,
  selectedAppointmentAtom
} from "@/app/atoms/appointmentAtoms";
import { AppointmentInput, AppointmentListResponse, AvailableTimesResponse } from "@/app/schemas/appointmentSchema";

export const useAppointments = () => {
  const [appointments, setAppointments] = useAtom(appointmentsAtom);
  const [pagination, setPagination] = useAtom(appointmentPaginationAtom);
  const [filters, setFilters] = useAtom(appointmentFiltersAtom);
  const [loading, setLoading] = useAtom(appointmentsLoadingAtom);
  const [createLoading, setCreateLoading] = useAtom(appointmentCreateLoadingAtom);
  const [cancelLoading, setCancelLoading] = useAtom(appointmentCancelLoadingAtom);
  const [confirmLoading, setConfirmLoading] = useAtom(appointmentConfirmLoadingAtom);
  const [availableTimesLoading, setAvailableTimesLoading] = useAtom(availableTimesLoadingAtom);
  const [availableTimes, setAvailableTimes] = useAtom(availableTimesAtom);
  const [selectedChairId, setSelectedChairId] = useAtom(selectedChairIdAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [selectedTime, setSelectedTime] = useAtom(selectedTimeAtom);
  const [error, setError] = useAtom(appointmentErrorAtom);
  const [successMessage, setSuccessMessage] = useAtom(appointmentSuccessMessageAtom);
  const [modalOpen, setModalOpen] = useAtom(appointmentModalOpenAtom);
  const [selectedAppointment, setSelectedAppointment] = useAtom(selectedAppointmentAtom);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", filters.page.toString());
      queryParams.set("limit", filters.limit.toString());
      if (filters.status !== "all") {
        queryParams.set("status", filters.status);
      }

      const response = await fetch(`/api/appointments/getAll?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar agendamentos");
      }

      const data: AppointmentListResponse = await response.json();
      setAppointments(data.appointments);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [filters, setAppointments, setPagination, setLoading, setError]);

  const fetchAvailableTimes = useCallback(async (chairId: number, date: string) => {
    setAvailableTimesLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("chairId", chairId.toString());
      queryParams.set("date", date);

      const response = await fetch(`/api/appointments/available-times?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar horários disponíveis");
      }

      const data: AvailableTimesResponse = await response.json();
      setAvailableTimes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setAvailableTimes(null);
    } finally {
      setAvailableTimesLoading(false);
    }
  }, [setAvailableTimesLoading, setAvailableTimes, setError]);

  const createAppointment = useCallback(async (input: AppointmentInput) => {
    setCreateLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Verificar se o usuário já tem um agendamento ativo
      const hasActiveAppointment = appointments.some(appointment => {
        // Exclui explicitamente agendamentos cancelados
        if (appointment.status === 'CANCELLED') return false;
        
        // Considera agendamentos SCHEDULED, CONFIRMED e COMPLETED como ativos
        const isActiveStatus = ['SCHEDULED', 'CONFIRMED', 'COMPLETED'].includes(appointment.status);
        
        if (!isActiveStatus) return false;
        
        // Verifica se o agendamento é futuro (incluindo hoje)
        const appointmentDate = new Date(appointment.datetimeStart);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove horário para comparar apenas a data
        
        return appointmentDate >= today;
      });

      if (hasActiveAppointment) {
        throw new Error("Você já possui um agendamento ativo. Só é possível fazer um novo agendamento após a conclusão do atual.");
      }

      const response = await fetch("/api/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar agendamento");
      }

      const newAppointment = await response.json();
      setAppointments(prev => [newAppointment, ...prev]);
      setSuccessMessage("Agendamento criado com sucesso!");
      
      // Reset form
      setSelectedChairId(null);
      setSelectedDate("");
      setSelectedTime("");
      setModalOpen(false);
      
      // Refresh list to get updated data
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCreateLoading(false);
    }
  }, [appointments, setCreateLoading, setError, setSuccessMessage, setAppointments, setSelectedChairId, setSelectedDate, setSelectedTime, setModalOpen, fetchAppointments]);

  const cancelAppointment = useCallback(async (id: number) => {
    setCancelLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/appointments/${id}/cancel`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao cancelar agendamento");
      }

      const updatedAppointment = await response.json();
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      setSuccessMessage("Agendamento cancelado com sucesso!");
      
      // Refresh list to get updated data
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCancelLoading(false);
    }
  }, [setCancelLoading, setError, setSuccessMessage, setAppointments, fetchAppointments]);

  const confirmAppointment = useCallback(async (id: number) => {
    setConfirmLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/appointments/confirm/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao confirmar agendamento");
      }

      const updatedAppointment = await response.json();
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      setSuccessMessage("Agendamento confirmado com sucesso!");
      
      // Refresh list to get updated data
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setConfirmLoading(false);
    }
  }, [setConfirmLoading, setError, setSuccessMessage, setAppointments, fetchAppointments]);

  const openModal = useCallback(() => {
    setModalOpen(true);
    setError("");
    setSuccessMessage("");
  }, [setModalOpen, setError, setSuccessMessage]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedChairId(null);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimes(null);
    setError("");
    setSuccessMessage("");
  }, [setModalOpen, setSelectedChairId, setSelectedDate, setSelectedTime, setAvailableTimes, setError, setSuccessMessage]);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccessMessage("");
  }, [setError, setSuccessMessage]);

  // Verifica se o usuário pode fazer um novo agendamento
  const canCreateAppointment = useCallback(() => {
    return !appointments.some(appointment => {
      // Exclui explicitamente agendamentos cancelados
      if (appointment.status === 'CANCELLED') return false;
      
      const isActiveStatus = ['SCHEDULED', 'CONFIRMED', 'COMPLETED'].includes(appointment.status);
      
      if (!isActiveStatus) return false;
      
      const appointmentDate = new Date(appointment.datetimeStart);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return appointmentDate >= today;
    });
  }, [appointments]);

  return {
    // Data
    appointments,
    pagination,
    filters,
    availableTimes,
    selectedChairId,
    selectedDate,
    selectedTime,
    selectedAppointment,
    
    // Loading states
    loading,
    createLoading,
    cancelLoading,
    confirmLoading,
    availableTimesLoading,
    
    // Modal state
    modalOpen,
    
    // Messages
    error,
    successMessage,
    
    // Actions
    fetchAppointments,
    fetchAvailableTimes,
    createAppointment,
    cancelAppointment,
    confirmAppointment,
    canCreateAppointment,
    
    // UI actions
    openModal,
    closeModal,
    clearMessages,
    
    // Setters
    setFilters,
    setSelectedChairId,
    setSelectedDate,
    setSelectedTime,
    setSelectedAppointment,
  };
}; 