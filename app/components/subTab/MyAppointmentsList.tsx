"use client";

import { useState } from "react";
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
  MapPinIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useMyAppointments } from "@/app/hooks/useMyAppointments";

interface MyAppointmentsListProps {
  onAppointmentChange?: () => void;
}

export const MyAppointmentsList = ({
  onAppointmentChange,
}: MyAppointmentsListProps) => {
  const {
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
  } = useMyAppointments();

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCancelAppointment = async (id: number) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      setCancellingId(id);
      const success = await cancelAppointment(id);
      if (success) {
        // Recarregar a lista para garantir sincronização
        await fetchMyAppointments();
        // Notificar o componente pai sobre a mudança
        onAppointmentChange?.();
      }
      setCancellingId(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Meus Agendamentos</h2>
          <p className="text-gray-600">
            Visualize e gerencie seus agendamentos
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircleIcon className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Status:
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            Carregando agendamentos...
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-gray-600">
            {filters.status !== "all"
              ? `Não há agendamentos com status "${getStatusLabel(
                  filters.status
                )}"`
              : "Você ainda não possui agendamentos"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => {
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
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-gray-900">
                              Agendamento #{appointment.id}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Criado em {formatCreatedAt(appointment.createdAt)}
                        </span>
                      </div>

                      {/* Date and Time */}
                      <div className="flex justify-between">
                        <div className="flex flex-col items-start gap-2">
                          <p className="text-sm font-medium text-gray-700">
                            Data e Horário
                          </p>
                          <p className="text-gray-900">
                            {date}, {time}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <p className="text-sm font-medium text-gray-700">
                            Cadeira
                          </p>
                          <p className="text-gray-900">
                            {appointment.chair?.name}
                          </p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Presença:</span>
                          <span>
                            {appointment.presenceConfirmed
                              ? "Confirmada"
                              : "Não confirmada"}
                          </span>
                        </div>
                        {isPastAppointment && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <ClockIcon className="h-4 w-4" />
                            <span>Passado</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {canCancel(appointment) && !isPastAppointment && (
                        <Button
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                          disabled={cancellingId === appointment.id}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
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
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
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
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Anterior
            </Button>

            <span className="text-sm text-gray-600">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Próxima
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
