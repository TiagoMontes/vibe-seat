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
  UserIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  CheckIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useScheduledAppointments } from "@/app/hooks/useScheduledAppointments";

interface ScheduledAppointmentsListProps {
  onAppointmentChange?: () => void;
}

export const ScheduledAppointmentsList = ({
  onAppointmentChange,
}: ScheduledAppointmentsListProps) => {
  const {
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
  } = useScheduledAppointments();

  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status: status as any, page: 1 }));
  };

  const handleConfirmAppointment = async (id: number) => {
    if (window.confirm("Tem certeza que deseja confirmar este agendamento?")) {
      setConfirmingId(id);
      const success = await confirmAppointment(id);
      if (success) {
        // Recarregar a lista para garantir sincronização
        await fetchScheduledAppointments();
        // Notificar o componente pai sobre a mudança
        onAppointmentChange?.();
      }
      setConfirmingId(null);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      setCancellingId(id);
      const success = await cancelAppointment(id);
      if (success) {
        // Recarregar a lista para garantir sincronização
        await fetchScheduledAppointments();
        // Notificar o componente pai sobre a mudança
        onAppointmentChange?.();
      }
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Lista de Agendamentos
          </h2>
          <p className="text-gray-600">
            Gerencie todos os agendamentos do sistema
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
              : "Não há agendamentos no sistema"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.datetimeStart);

            return (
              <Card
                key={appointment.id}
                className={`${
                  appointment.status === "CANCELLED"
                    ? "border-red-200 bg-red-50"
                    : appointment.status === "CONFIRMED"
                    ? "border-green-200 bg-green-50"
                    : "border-yellow-200 bg-yellow-50"
                }`}
              >
                <CardContent>
                  <div className="flex flex-col w-full lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col w-full justify-between">
                      {/* Header */}
                      <div className="flex flex-col justify-between">
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
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{time}</span>
                        </div>
                      </div>

                      {/* User and Chair Info */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {appointment.user.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {appointment.chair.name}
                            {appointment.chair.location && (
                              <span className="text-gray-500">
                                {" "}
                                - {appointment.chair.location}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Presence Confirmation */}
                      {appointment.presenceConfirmed && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckIcon className="h-4 w-4 text-green-600" />
                          <span className="text-green-700 font-medium">
                            Presença confirmada
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {/* Confirm Button - only for SCHEDULED appointments */}
                      {appointment.status === "SCHEDULED" && (
                        <Button
                          onClick={() =>
                            handleConfirmAppointment(appointment.id)
                          }
                          disabled={confirmingId === appointment.id}
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          {confirmingId === appointment.id ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                              Confirmando...
                            </div>
                          ) : (
                            <>
                              <CheckIcon className="h-4 w-4" />
                              Confirmar
                            </>
                          )}
                        </Button>
                      )}

                      {/* Cancel Button - only for SCHEDULED and CONFIRMED appointments */}
                      {(appointment.status === "SCHEDULED" ||
                        appointment.status === "CONFIRMED") && (
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando página {pagination.currentPage} de{" "}
                {pagination.totalPages} ({pagination.totalItems} agendamentos)
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
                  {pagination.currentPage} / {pagination.totalPages}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};
