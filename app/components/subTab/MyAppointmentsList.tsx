"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  CalendarIcon,
  ClockIcon,
  AlertCircleIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useAppointments } from "@/app/hooks/useAppointments";
import { useToast } from "@/app/hooks/useToast";
import { useConfirm } from "@/app/hooks/useConfirm";
import {
  myAppointmentsAtom,
  myAppointmentPaginationAtom,
  myAppointmentFiltersAtom,
  myAppointmentsLoadingAtom,
  appointmentCancelLoadingAtom,
} from "@/app/atoms/appointmentAtoms";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel, getStatusVariant } from "@/app/lib/utils";
import { Appointment } from "@/app/types/api";

interface MyAppointmentsListProps {
  onAppointmentChange?: () => void;
}

export const MyAppointmentsList = ({
  onAppointmentChange,
}: MyAppointmentsListProps) => {
  const { fetchMyAppointments, cancelAppointment } = useAppointments();
  const { appointmentSuccess, appointmentError } = useToast();
  const { confirm, ConfirmComponent } = useConfirm();

  // Atoms do Jotai
  const [appointments, setAppointments] = useAtom(myAppointmentsAtom);
  const [pagination] = useAtom(myAppointmentPaginationAtom);
  const [filters, setFilters] = useAtom(myAppointmentFiltersAtom);
  const [loading, setLoading] = useAtom(myAppointmentsLoadingAtom);
  const [cancelLoading, setCancelLoading] = useAtom(
    appointmentCancelLoadingAtom
  );

  const [error, setError] = useState<string>("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Use refs to avoid dependency issues
  const fetchMyAppointmentsRef = useRef(fetchMyAppointments);
  const appointmentErrorRef = useRef(appointmentError);
  const setAppointmentsRef = useRef(setAppointments);

  // Update refs when functions change
  fetchMyAppointmentsRef.current = fetchMyAppointments;
  appointmentErrorRef.current = appointmentError;
  setAppointmentsRef.current = setAppointments;

  const handleFetchMyAppointments = useCallback(async () => {
    setError("");
    try {
      await fetchMyAppointmentsRef.current({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
      });
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setError("Erro ao carregar agendamentos");
      appointmentErrorRef.current("Erro ao carregar agendamentos");
    }
  }, [filters.page, filters.limit, filters.status]);

  // Fetch appointments on mount and when filters change
  useEffect(() => {
    // Limpar dados antigos e carregar novos
    setAppointmentsRef.current([]);
    handleFetchMyAppointments();
  }, [filters.status, filters.page, filters.limit, handleFetchMyAppointments]);

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as "all" | "SCHEDULED" | "CONFIRMED" | "CANCELLED",
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCancelAppointment = async (id: number) => {
    const confirmed = await confirm({
      title: "Cancelar Agendamento",
      description:
        "Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.",
      confirmText: "Cancelar Agendamento",
      cancelText: "Manter Agendamento",
      destructive: true,
    });

    if (confirmed) {
      setCancellingId(id);
      setCancelLoading(true);
      try {
        await cancelAppointment(id);
        appointmentSuccess("Agendamento cancelado com sucesso!");
        // Recarregar a lista para garantir sincronização
        await handleFetchMyAppointments();
        // Notificar o componente pai sobre a mudança
        onAppointmentChange?.();
      } catch (error) {
        console.error("Erro ao cancelar agendamento:", error);
        appointmentError("Erro ao cancelar agendamento");
      } finally {
        setCancellingId(null);
        setCancelLoading(false);
      }
    }
  };

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

  const canCancel = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.datetimeStart);
    const now = new Date();
    const hoursDiff =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return appointment.status === "SCHEDULED" && hoursDiff >= 3;
  };

  const isPast = (datetime: string) => {
    const appointmentDate = new Date(datetime);
    const now = new Date();
    return appointmentDate < now;
  };

  // Filter appointments based on status
  const filteredAppointments = (
    Array.isArray(appointments) ? appointments : []
  ).filter((appointment) => {
    if (filters.status === "all") return true;
    return appointment.status === filters.status;
  });

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Meus Agendamentos
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Visualize e gerencie seus agendamentos
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 sm:p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Status:
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="SCHEDULED">Agendado</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm sm:text-base">
              Carregando agendamentos...
            </span>
          </div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            {filters.status !== "all"
              ? `Não há agendamentos com status "${getStatusLabel(
                  filters.status || "unknown"
                )}"`
              : "Você ainda não possui agendamentos"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAppointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.datetimeStart);
            const isPastAppointment = isPast(appointment.datetimeStart);

            return (
              <Card
                key={appointment.id}
                className={`${isPastAppointment ? "opacity-75" : ""} ${
                  appointment.status === "CANCELLED"
                    ? "border-red-200 bg-red-50"
                    : appointment.status === "SCHEDULED"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                          <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            Agendamento #{appointment.id}
                          </span>
                        </div>
                        <Badge
                          variant={
                            getStatusVariant(appointment.status) as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                          }
                        >
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        Criado em {formatCreatedAt(appointment.createdAt)}
                      </span>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Data e Horário
                        </p>
                        <p className="text-sm sm:text-base text-gray-900">
                          {date}
                        </p>
                        <p className="text-sm sm:text-base text-gray-900 font-medium">
                          {time}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Cadeira
                        </p>
                        <p className="text-sm sm:text-base text-gray-900">
                          {appointment.chair?.name}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {isPastAppointment && (
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <ClockIcon className="h-4 w-4" />
                        <span>Passado</span>
                      </div>
                    )}

                    {/* Actions */}
                    {canCancel(appointment) && !isPastAppointment && (
                      <div className="pt-2 border-t border-gray-200">
                        <Button
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                          disabled={
                            cancellingId === appointment.id || cancelLoading
                          }
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {cancellingId === appointment.id ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              Cancelando...
                            </div>
                          ) : (
                            <>
                              <XIcon className="h-4 w-4" />
                              Cancelar
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Mostrando{" "}
            {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} a{" "}
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            de {pagination.totalItems} agendamentos
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="text-xs sm:text-sm"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              {pagination.currentPage} de {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <ConfirmComponent />
    </div>
  );
};
