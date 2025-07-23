"use client";

import { useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Pagination } from "@/app/components/ui/pagination";
import { useAppointments } from "@/app/hooks/useAppointments";
import { useAuth } from "@/app/hooks/useAuth";
import {
  getStatusLabel,
  getStatusColor,
  canCancelAppointment,
  getCancellationMessage,
  getStatusOptions,
} from "@/app/schemas/appointmentSchema";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon,
  RefreshCwIcon,
} from "lucide-react";

export const AppointmentList = () => {
  const { user } = useAuth();
  const {
    appointments,
    pagination,
    filters,
    loading,
    cancelLoading,
    confirmLoading,
    error,
    successMessage,
    fetchAppointments,
    cancelAppointment,
    confirmAppointment,
    setFilters,
    clearMessages,
  } = useAppointments();

  // Fetch appointments on component mount and when filters change
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, clearMessages]);

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters({
      ...filters,
      status: status as typeof filters.status,
      page: 1,
    });
  };

  const handleCancelAppointment = async (id: number) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      await cancelAppointment(id);
    }
  };

  const handleConfirmAppointment = async (id: number) => {
    if (
      window.confirm(
        "Tem certeza que deseja confirmar a presença neste agendamento?"
      )
    ) {
      await confirmAppointment(id);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("pt-BR"),
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusBadgeClasses = (status: string) => {
    const color = getStatusColor(status as any);
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (color) {
      case "green":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "blue":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "red":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "yellow":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  import { isAdmin } from "@/app/lib/utils";

  const userIsAdmin = isAdmin(user?.roleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Meus Agendamentos
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie seus agendamentos de massagem
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchAppointments()}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCwIcon
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircleIcon className="h-4 w-4" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
          <CheckIcon className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {getStatusOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
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
              <p className="text-gray-600 mb-4">
                Você ainda não possui agendamentos{" "}
                {filters.status !== "all"
                  ? `com status "${getStatusLabel(filters.status as any)}"`
                  : ""}
                .
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const { date, time } = formatDateTime(
                  appointment.datetimeStart
                );
                const canCancel = canCancelAppointment(appointment, user?.role);
                const cancellationMessage = getCancellationMessage(
                  appointment,
                  user?.role
                );

                return (
                  <Card
                    key={appointment.id}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 flex-wrap">
                            <span
                              className={getStatusBadgeClasses(
                                appointment.status
                              )}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                            {appointment.presenceConfirmed && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Presença Confirmada
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4" />
                              <span>{time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              <span>
                                {appointment.chair?.name ||
                                  `Cadeira ${appointment.chairId}`}
                              </span>
                            </div>
                            {appointment.chair?.location && (
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4" />
                                <span>{appointment.chair.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Cancel Button */}
                          {canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCancelAppointment(appointment.id)
                              }
                              disabled={cancelLoading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XIcon className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          )}

                          {/* Confirm Button (Admin only) */}
                          {isAdmin && appointment.status === "SCHEDULED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleConfirmAppointment(appointment.id)
                              }
                              disabled={confirmLoading}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          )}

                          {/* Info about why can't cancel */}
                          {!canCancel && cancellationMessage && (
                            <div className="text-xs text-gray-500 max-w-xs">
                              {cancellationMessage}
                            </div>
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
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={handlePageChange}
                onNextPage={() => handlePageChange(pagination.currentPage + 1)}
                onPrevPage={() => handlePageChange(pagination.currentPage - 1)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
