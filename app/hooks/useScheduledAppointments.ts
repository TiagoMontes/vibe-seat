import { useCallback, useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
}

interface Chair {
  id: number;
  name: string;
  location: string;
}

interface ScheduledAppointment {
  id: number;
  userId: number;
  chairId: number;
  datetimeStart: string;
  datetimeEnd: string;
  status: string;
  presenceConfirmed: boolean;
  createdAt: string;
  user: User;
  chair: Chair;
}

interface ScheduledAppointmentsResponse {
  appointments: ScheduledAppointment[];
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

export const useScheduledAppointments = () => {
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([]);
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
    page: 1,
    limit: 10,
    status: "all" as "all" | "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
  });

  const fetchScheduledAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", filters.page.toString());
      queryParams.set("limit", filters.limit.toString());
      if (filters.status !== "all") {
        queryParams.set("status", filters.status);
      }

      const response = await fetch(`/api/appointments/scheduled?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar agendamentos");
      }

      const data: ScheduledAppointmentsResponse = await response.json();
      
      // Não filtrar mais - mostrar todos os status
      setAppointments(data.appointments);
      
      // Calcular paginação baseada nos agendamentos retornados
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
  }, [filters]);

  const confirmAppointment = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/appointments/confirm/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao confirmar agendamento");
      }

      // Atualizar o status do agendamento localmente para CONFIRMED
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: "CONFIRMED" } : apt)
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      return false;
    }
  }, []);

  const cancelAppointment = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/appointments/cancel/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao cancelar agendamento");
      }

      // Atualizar o status do agendamento localmente para CANCELLED
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: "CANCELLED" } : apt)
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      return false;
    }
  }, []);

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

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const formatCreatedAt = (createdAt: string) => {
    return new Date(createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchScheduledAppointments();
  }, [fetchScheduledAppointments]);

  return {
    appointments,
    loading,
    error,
    pagination,
    filters,
    fetchScheduledAppointments,
    confirmAppointment,
    cancelAppointment,
    getStatusLabel,
    getStatusColor,
    formatDateTime,
    formatCreatedAt,
    setFilters,
  };
}; 