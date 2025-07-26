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
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  AlertCircleIcon,
  CheckIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useAppointments } from "@/app/hooks/useAppointments";
import { useToast } from "@/app/hooks/useToast";
import { useConfirm } from "@/app/hooks/useConfirm";
import {
  appointmentsAtom,
  appointmentPaginationAtom,
  appointmentCancelLoadingAtom,
  appointmentConfirmLoadingAtom,
} from "@/app/atoms/appointmentAtoms";
import { getStatusVariant } from "@/app/lib/utils";

interface ScheduledAppointmentsListProps {
  onAppointmentChange?: () => void;
}

export const ScheduledAppointmentsList = ({
  onAppointmentChange,
}: ScheduledAppointmentsListProps) => {
  const { fetchAppointments, confirmAppointment, cancelAppointment } =
    useAppointments();
  const { appointmentSuccess, appointmentError } = useToast();
  const { confirm, ConfirmComponent } = useConfirm();

  // Atoms do Jotai
  const [appointments, setAppointments] = useAtom(appointmentsAtom);
  const [pagination] = useAtom(appointmentPaginationAtom);
  const [cancelLoading, setCancelLoading] = useAtom(
    appointmentCancelLoadingAtom
  );
  const [confirmLoading, setConfirmLoading] = useAtom(
    appointmentConfirmLoadingAtom
  );

  const [loading, setLoading] = useState(true); // Começar como true para evitar flash de dados antigos
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState({
    status: "all" as "all" | "SCHEDULED" | "CONFIRMED" | "CANCELLED",
    page: 1,
    limit: 10,
  });

  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Use refs to avoid dependency issues
  const fetchAppointmentsRef = useRef(fetchAppointments);
  const appointmentErrorRef = useRef(appointmentError);
  const setAppointmentsRef = useRef(setAppointments);

  // Update refs when functions change
  fetchAppointmentsRef.current = fetchAppointments;
  appointmentErrorRef.current = appointmentError;
  setAppointmentsRef.current = setAppointments;

  const handleFetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await fetchAppointmentsRef.current({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
      });
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setError("Erro ao carregar agendamentos");
      appointmentErrorRef.current("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.status]);

  // Fetch appointments on mount and when filters change
  useEffect(() => {
    // Limpar dados antigos e carregar novos
    setAppointmentsRef.current([]);
    handleFetchAppointments();
  }, [filters.status, filters.page, filters.limit, handleFetchAppointments]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as "all" | "SCHEDULED" | "CONFIRMED" | "CANCELLED",
      page: 1,
    }));
  };

  const handleConfirmAppointment = async (id: number) => {
    const confirmed = await confirm({
      title: "Confirmar Agendamento",
      description:
        "Tem certeza que deseja confirmar este agendamento? O usuário será notificado sobre a confirmação.",
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      destructive: false,
    });

    if (confirmed) {
      setConfirmingId(id);
      setConfirmLoading(true);
      try {
        await confirmAppointment(id);
        appointmentSuccess("Agendamento confirmado com sucesso!");
        // Recarregar a lista para garantir sincronização
        await handleFetchAppointments();
        // Notificar o componente pai sobre a mudança
        onAppointmentChange?.();
      } catch (error) {
        console.error("Erro ao confirmar agendamento:", error);
        appointmentError("Erro ao confirmar agendamento");
      } finally {
        setConfirmingId(null);
        setConfirmLoading(false);
      }
    }
  };

  const handleCancelAppointment = async (id: number) => {
    const confirmed = await confirm({
      title: "Cancelar Agendamento",
      description:
        "Tem certeza que deseja cancelar este agendamento? O usuário será notificado sobre o cancelamento.",
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
        await handleFetchAppointments();
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

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      SCHEDULED: "Agendado",
      CONFIRMED: "Confirmado",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
    };
    return statusMap[status] || status;
  };

  // Filter appointments based on status
  const filteredAppointments = appointments.filter((appointment) => {
    if (filters.status === "all") return true;
    return appointment.status === filters.status;
  });

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Lista de Agendamentos
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerencie todos os agendamentos do sistema
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
              Status:
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full sm:w-auto px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
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
        <div className="text-center py-8 sm:py-12">
          <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {filters.status !== "all"
              ? `Não há agendamentos com status "${getStatusLabel(
                  filters.status
                )}"`
              : "Não há agendamentos no sistema"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredAppointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.datetimeStart);

            return (
              <Card
                key={appointment.id}
                className={`${
                  appointment.status === "CANCELLED"
                    ? "border-red-200 bg-red-50"
                    : appointment.status === "CONFIRMED"
                    ? "border-green-200 bg-green-50"
                    : appointment.status === "SCHEDULED"
                    ? "border-blue-200 bg-blue-50"
                    : "border-yellow-200 bg-yellow-50"
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                            Agendamento #{appointment.id}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Criado em {formatCreatedAt(appointment.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          getStatusVariant(appointment.status) as
                            | "default"
                            | "secondary"
                            | "destructive"
                            | "outline"
                        }
                        className="whitespace-nowrap"
                      >
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>

                    {/* Date and Time */}
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">
                              Data
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 pl-6">{date}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">
                              Horário
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 pl-6">{time}</p>
                        </div>
                      </div>
                    </div>

                    {/* User and Chair Info */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">
                            Usuário
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 pl-6 break-words">
                          {appointment.user?.username ||
                            "Usuário não informado"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">
                            Cadeira
                          </span>
                        </div>
                        <div className="pl-6">
                          <p className="text-sm text-gray-900 break-words">
                            {appointment.chair?.name || "Cadeira não informada"}
                          </p>
                          {appointment.chair?.location && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {appointment.chair.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {(appointment.status === "SCHEDULED" ||
                      appointment.status === "CONFIRMED") && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                        {/* Confirm Button - only for SCHEDULED appointments */}
                        {appointment.status === "SCHEDULED" && (
                          <Button
                            onClick={() =>
                              handleConfirmAppointment(appointment.id)
                            }
                            disabled={
                              confirmingId === appointment.id || confirmLoading
                            }
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300 hover:bg-green-50 text-xs sm:text-sm h-9 w-full sm:flex-1"
                          >
                            {confirmingId === appointment.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                                <span className="hidden sm:inline">
                                  Confirmando...
                                </span>
                                <span className="sm:hidden">...</span>
                              </div>
                            ) : (
                              <>
                                <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="ml-1">Confirmar</span>
                              </>
                            )}
                          </Button>
                        )}

                        {/* Cancel Button - for SCHEDULED and CONFIRMED appointments */}
                        <Button
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                          disabled={
                            cancellingId === appointment.id || cancelLoading
                          }
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 text-xs sm:text-sm h-9 w-full sm:flex-1"
                        >
                          {cancellingId === appointment.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              <span className="hidden sm:inline">
                                Cancelando...
                              </span>
                              <span className="sm:hidden">...</span>
                            </div>
                          ) : (
                            <>
                              <XIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="ml-1">Cancelar</span>
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
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Mostrando página {pagination.currentPage} de{" "}
                {pagination.totalPages} ({pagination.totalItems} agendamentos)
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                >
                  <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-1">Anterior</span>
                </Button>
                <span className="text-xs sm:text-sm text-gray-600 px-2">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline mr-1">Próxima</span>
                  <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <ConfirmComponent />
    </div>
  );
};
