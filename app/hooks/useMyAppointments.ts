import { useCallback, useState, useEffect } from "react";
import { useAtom } from "jotai";
import { appointmentsAtom } from "@/app/atoms/appointmentAtoms";
import { Appointment } from "@/app/schemas/appointmentSchema";

interface Chair {
  id: number;
  name: string;
  location: string;
}

interface MyAppointmentsResponse {
  appointments: Appointment[];
  total: number;
  message: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const useMyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    limit: 10,
  });

  // Estado global de appointments para sincronização
  const [globalAppointments, setGlobalAppointments] = useAtom(appointmentsAtom);

  const fetchMyAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", filters.page.toString());
      queryParams.set("limit", filters.limit.toString());
      if (filters.status !== "all") {
        queryParams.set("status", filters.status);
      }

      const response = await fetch(`/api/appointments/my-appointments?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar agendamentos");
      }

      const data: MyAppointmentsResponse = await response.json();
      setAppointments(data.appointments);
      
      // Atualizar também o estado global
      setGlobalAppointments(data.appointments);
      
      // Calcular paginação
      const totalPages = Math.ceil(data.total / filters.limit);
      setPagination({
        currentPage: filters.page,
        totalPages,
        totalItems: data.total,
        itemsPerPage: filters.limit,
        hasNextPage: filters.page < totalPages,
        hasPrevPage: filters.page > 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [filters, setGlobalAppointments]);

  const cancelAppointment = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/appointments/cancel/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao cancelar agendamento");
      }

      // Atualizar o status do agendamento localmente
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: "CANCELLED" } : apt)
      );

      // Atualizar também o estado global
      setGlobalAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: "CANCELLED" } : apt)
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      return false;
    }
  }, [setGlobalAppointments]);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Agendado";
      case "CONFIRMED":
        return "Confirmado";
      case "COMPLETED":
        return "Concluído";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const canCancel = useCallback((appointment: Appointment) => {
    return appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED";
  }, []);

  const isPast = useCallback((datetimeStart: string) => {
    const appointmentDate = new Date(datetimeStart);
    const now = new Date();
    return appointmentDate < now;
  }, []);

  useEffect(() => {
    fetchMyAppointments();
  }, [fetchMyAppointments]);

  return {
    appointments,
    loading,
    error,
    pagination,
    filters,
    fetchMyAppointments,
    cancelAppointment,
    getStatusLabel,
    getStatusColor,
    canCancel,
    isPast,
    setFilters,
  };
}; 