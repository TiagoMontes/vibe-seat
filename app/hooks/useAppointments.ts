import { useCallback, useRef } from "react";
import { useAtom } from "jotai";
import { useToast } from "./useToast";
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
  const [modalOpen, setModalOpen] = useAtom(appointmentModalOpenAtom);
  const [selectedAppointment, setSelectedAppointment] = useAtom(selectedAppointmentAtom);
  
  const { appointmentSuccess, appointmentError } = useToast();
  
  const hasLoadedRef = useRef(false);

  const fetchAppointments = useCallback(async (showLoading = true) => {
    const shouldShowLoading = showLoading && (!hasLoadedRef.current || appointments.length === 0);
    
    if (shouldShowLoading) {
      setLoading(true);
    }

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
      hasLoadedRef.current = true;
    } catch (err) {
      appointmentError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  }, [filters, setAppointments, setPagination, setLoading, appointmentError, appointments.length]);

  const fetchAvailableTimes = useCallback(async (chairId: number, date: string) => {
    setAvailableTimesLoading(true);

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
      appointmentError(err instanceof Error ? err.message : "Erro desconhecido");
      setAvailableTimes(null);
    } finally {
      setAvailableTimesLoading(false);
    }
  }, [setAvailableTimesLoading, setAvailableTimes, appointmentError]);

  const createAppointment = useCallback(async (input: AppointmentInput): Promise<boolean> => {
    setCreateLoading(true);

    try {
      // Buscar agendamentos do usuário para validação usando a rota correta
      const validationResponse = await fetch("/api/appointments/my-appointments?page=1&limit=100&status=all");
      
      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();
        console.error("Erro ao buscar agendamentos para validação:", errorData);
        throw new Error(errorData.error || "Erro ao validar agendamentos existentes");
      }
      
      const validationData = await validationResponse.json();
      
      console.log("Dados de validação:", {
        confirmedUpcoming: validationData.confirmedUpcoming,
        confirmedDone: validationData.confirmedDone,
        scheduled: validationData.scheduled,
        total: validationData.total
      });

      // Validar baseado nos campos do backend:
      // - confirmedUpcoming > 0: Usuário tem agendamento confirmado futuro (não pode criar)
      // - scheduled > 0: Usuário tem agendamento agendado (não pode criar)
      // - confirmedUpcoming === 0 && scheduled === 0: Usuário não tem agendamentos ativos (pode criar)
      // - confirmedDone > 0: Usuário já teve agendamentos confirmados (pode criar novos)
      if (validationData.confirmedUpcoming > 0 || validationData.scheduled > 0) {
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
      appointmentSuccess("Agendamento criado com sucesso!");
      
      // Reset form
      setSelectedChairId(null);
      setSelectedDate("");
      setSelectedTime("");
      setModalOpen(false);
      
      // Não precisamos recarregar a lista, pois já adicionamos o novo agendamento
      return true; // Sucesso
    } catch (err) {
      appointmentError(err instanceof Error ? err.message : "Erro desconhecido");
      return false; // Erro
    } finally {
      setCreateLoading(false);
    }
  }, [appointments, setCreateLoading, appointmentError, appointmentSuccess, setAppointments, setSelectedChairId, setSelectedDate, setSelectedTime, setModalOpen, fetchAppointments]);

  const cancelAppointment = useCallback(async (id: number) => {
    setCancelLoading(true);

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
      appointmentSuccess("Agendamento cancelado com sucesso!");
      
      // Não precisamos recarregar a lista, pois já atualizamos o agendamento
    } catch (err) {
      appointmentError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCancelLoading(false);
    }
  }, [setCancelLoading, appointmentError, appointmentSuccess, setAppointments, fetchAppointments]);

  const confirmAppointment = useCallback(async (id: number) => {
    setConfirmLoading(true);

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
      appointmentSuccess("Agendamento confirmado com sucesso!");
      
      // Não precisamos recarregar a lista, pois já atualizamos o agendamento
    } catch (err) {
      appointmentError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setConfirmLoading(false);
    }
  }, [setConfirmLoading, appointmentError, appointmentSuccess, setAppointments, fetchAppointments]);

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedChairId(null);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimes(null);
  }, [setModalOpen, setSelectedChairId, setSelectedDate, setSelectedTime, setAvailableTimes]);

  const clearMessages = useCallback(() => {
    // Não é mais necessário limpar mensagens, pois usamos toasts
  }, []);

  // Função para limpar o estado dos agendamentos
  const clearAppointments = useCallback(() => {
    setAppointments([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPrevPage: false,
    });
    setFilters({
      page: 1,
      limit: 10,
      status: "all",
    });
  }, [setAppointments, setPagination, setFilters]);

  // Verifica se o usuário pode fazer um novo agendamento
  const canCreateAppointment = useCallback(async () => {
    try {
      const response = await fetch("/api/appointments/my-appointments?page=1&limit=100&status=all");
      
      if (!response.ok) {
        console.error("Erro ao verificar se pode criar agendamento");
        return false;
      }
      
      const data = await response.json();
      
      // Pode criar se não há agendamentos ativos (confirmados futuros ou agendados)
      return data.confirmedUpcoming === 0 && data.scheduled === 0;
    } catch (error) {
      console.error("Erro ao verificar permissão para criar agendamento:", error);
      return false;
    }
  }, []);

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
    
    // Messages - agora usando toasts
    
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
    
    // State management
    clearAppointments,
    
    // Setters
    setFilters,
    setSelectedChairId,
    setSelectedDate,
    setSelectedTime,
    setSelectedAppointment,
  };
}; 