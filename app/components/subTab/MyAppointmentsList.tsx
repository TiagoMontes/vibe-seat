"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
import {
  CalendarIcon,
  ClockIcon,
  AlertCircleIcon,
  XIcon,
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
import GenericFilter from "@/app/components/GenericFilter";
import { PaginationComponent } from "@/app/components/PaginationComponent";

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
  const [loading] = useAtom(myAppointmentsLoadingAtom);
  const [cancelLoading, setCancelLoading] = useAtom(
    appointmentCancelLoadingAtom
  );

  const [error, setError] = useState<string>("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Status and sort options
  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "SCHEDULED", label: "Agendado" },
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "COMPLETED", label: "Concluído" },
    { value: "CANCELLED", label: "Cancelado" },
  ];

  const sortOptions = [
    { value: "newest", label: "Mais recentes" },
    { value: "oldest", label: "Mais antigos" },
  ];

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
        search: filters.search,
        sortBy: filters.sortBy,
      });
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setError("Erro ao carregar agendamentos");
      appointmentErrorRef.current("Erro ao carregar agendamentos");
    }
  }, [filters.page, filters.limit, filters.status, filters.search, filters.sortBy]);

  // Fetch appointments on mount and when filters change
  useEffect(() => {
    // Limpar dados antigos e carregar novos
    setAppointmentsRef.current([]);
    handleFetchMyAppointments();
  }, [filters.status, filters.page, filters.limit, filters.search, filters.sortBy, handleFetchMyAppointments]);

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as "all" | "SCHEDULED" | "CONFIRMED" | "CANCELLED",
      page: 1,
    }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as "newest" | "oldest",
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: "",
      status: "all",
      sortBy: "newest",
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const goToPage = (page: number) => {
    handlePageChange(page);
  };

  const hasActiveFilters =
    (filters.search && filters.search.trim() !== "") ||
    filters.status !== "all" ||
    filters.sortBy !== "newest";

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

  // Use appointments directly since filtering is done on the server
  const filteredAppointments = Array.isArray(appointments) ? appointments : [];

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

      {/* Generic Filter */}
      <GenericFilter
        searchPlaceholder="Buscar agendamentos..."
        searchValue={filters.search || ""}
        onSearchChange={handleSearchChange}
        statusOptions={statusOptions}
        statusValue={filters.status}
        onStatusChange={handleStatusFilterChange}
        statusLabel="Status"
        sortOptions={sortOptions}
        sortValue={filters.sortBy}
        onSortChange={handleSortChange}
        sortLabel="Ordenar por"
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

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
        <PaginationComponent
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          goToPage={(_, page) => goToPage(page)}
          selectedDate=""
          totalItems={pagination.totalItems}
        />
      )}
      <ConfirmComponent />
    </div>
  );
};
