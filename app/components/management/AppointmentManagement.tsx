"use client";

import { useEffect, useState, useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { useAppointments } from "@/app/hooks/useAppointments";
import { useChairs } from "@/app/hooks/useChairs";
import { useSchedules } from "@/app/hooks/useSchedules";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import {
  availableTimesAtom,
  availableTimesLoadingAtom,
  appointmentCreateLoadingAtom,
  appointmentModalOpenAtom,
} from "@/app/atoms/appointmentAtoms";
import { Chair } from "@/app/types/api";
import { MyAppointmentsList } from "@/app/components/subTab/MyAppointmentsList";
import { ScheduledAppointmentsList } from "@/app/components/subTab/ScheduledAppointmentsList";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  XIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  UsersIcon,
} from "lucide-react";
import { PaginationComponent } from "@/app/components/PaginationComponent";
import { AppointmentModal } from "@/app/components/modal/AppointmentModal";

interface ChairCardProps {
  chair: Chair;
  availableTimes: Array<{ time: string; available: boolean; reason?: string }>;
  onTimeSelect: (chairId: number, time: string) => void;
  createLoading: boolean;
  selectedDate?: string | null;
}

// Função utilitária para separar data e hora de uma string ISO
const formatDateTime = (
  dateTimeString: string
): { date: string; time: string } => {
  try {
    const date = new Date(dateTimeString);

    // Formata a data para dd/mm/aaaa
    const formattedDate = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Formata o horário para hh:mm
    const formattedTime = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      date: formattedDate,
      time: formattedTime,
    };
  } catch (error) {
    // Se houver erro na formatação, retorna valores padrão
    return {
      date: "Data inválida",
      time: "Horário inválido",
    };
  }
};

const ChairCard = ({
  chair,
  availableTimes,
  onTimeSelect,
  createLoading,
}: ChairCardProps) => {
  return (
    <Card className="h-full border border-gray-200 p-4 flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {chair.name}
        </CardTitle>
        {chair.location && (
          <p className="text-sm text-gray-600">{chair.location}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <ClockIcon className="h-4 w-4" />
            Horários disponíveis
          </div>

          {availableTimes.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((timeSlot) => {
                // Usa a função para formatar o datetime
                const { time } = formatDateTime(timeSlot.time);

                return (
                  <button
                    key={timeSlot.time}
                    onClick={() => onTimeSelect(chair.id, timeSlot.time)}
                    disabled={createLoading || !timeSlot.available}
                    className={`p-3 text-sm rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      timeSlot.available
                        ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-red-300 bg-red-50 text-red-700 cursor-not-allowed"
                    }`}
                    title={
                      timeSlot.reason ||
                      (timeSlot.available ? "Disponível" : "Ocupado")
                    }
                  >
                    <div className="text-center">
                      <div className="font-medium">{time}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum horário disponível
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface DatePickerModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const DatePickerModal = ({
  open,
  onClose,
  selectedDate,
  onDateSelect,
}: DatePickerModalProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay };
  };

  const isToday = (day: number) => {
    const today = new Date();
    const currentDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return today.toDateString() === currentDate.toDateString();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
      .toISOString()
      .split("T")[0];
    return dateStr === selectedDate;
  };

  const isPast = (day: number) => {
    const today = new Date();
    const currentDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return currentDate < today;
  };

  const handleDateClick = (day: number) => {
    if (isPast(day)) return;
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
      .toISOString()
      .split("T")[0];
    onDateSelect(dateStr);
    onClose();
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Selecionar Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1
                  )
                )
              }
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1
                  )
                )
              }
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-sm">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center font-medium text-gray-500 p-2"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: startingDay }, (_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isPastDay = isPast(day);
              const isTodayDay = isToday(day);
              const isSelectedDay = isSelected(day);

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={isPastDay}
                  className={`
                    p-2 rounded-md transition-colors
                    ${
                      isPastDay
                        ? "text-gray-300 cursor-not-allowed"
                        : isSelectedDay
                        ? "bg-blue-600 text-white"
                        : isTodayDay
                        ? "bg-blue-100 text-blue-800"
                        : "hover:bg-gray-100"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AppointmentManagement = () => {
  const { user } = useAuth();
  const { chairs, fetchChairs, loading: chairsLoading } = useChairs();
  const { fetchSchedules, loading: schedulesLoading } = useSchedules();
  const { createAppointment, fetchAppointments, fetchAvailableTimes } =
    useAppointments();
  const { appointmentSuccess, appointmentError } = useToast();

  // Atoms do Jotai
  const [availableTimesData, setAvailableTimesData] =
    useAtom(availableTimesAtom);
  const [availableTimesLoading, setAvailableTimesLoading] = useAtom(
    availableTimesLoadingAtom
  );
  const [createLoading, setCreateLoading] = useAtom(
    appointmentCreateLoadingAtom
  );
  const [, setModalOpen] = useAtom(appointmentModalOpenAtom);

  // Local state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "schedule" | "my-appointments" | "scheduled-list"
  >("schedule");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Fetch chairs and schedules on mount - apenas uma vez
  useEffect(() => {
    const loadInitialData = async () => {
      if (isFirstLoad) {
        await Promise.all([fetchChairs(), fetchSchedules()]);
        setIsFirstLoad(false);
      }
    };

    loadInitialData();
  }, [isFirstLoad, fetchChairs, fetchSchedules]);

  // Fetch available times when date is selected
  useEffect(() => {
    if (selectedDate) {
      // Always try to fetch available times for the selected date
      handleFetchAvailableTimes(selectedDate, 1);
    } else {
      setAvailableTimesData(null);
    }
  }, [selectedDate]);

  // Sincronizar estado quando mudar de seção - apenas quando necessário
  useEffect(() => {
    // Atualizar agendamentos apenas quando mudar para seções que precisam dos dados
    if (
      activeSection === "my-appointments" ||
      activeSection === "scheduled-list"
    ) {
      fetchAppointments();
    }
  }, [activeSection, fetchAppointments]);

  console.log(chairs)

  // Função para buscar horários disponíveis usando o hook
  const handleFetchAvailableTimes = useCallback(
    async (date: string, page: number = 1, append: boolean = false) => {
      setAvailableTimesLoading(true);
      try {
        const data = await fetchAvailableTimes(date, page, 3);
        if (append && availableTimesData?.chairs) {
          // Adiciona novas cadeiras às existentes
          setAvailableTimesData({
            ...data,
            chairs: [...availableTimesData.chairs, ...data.chairs],
          });
        } else {
          // Substitui as cadeiras existentes
          setAvailableTimesData(data);
        }
      } catch (error) {
        console.error("Erro ao buscar horários disponíveis:", error);
        appointmentError("Erro ao buscar horários disponíveis");
      } finally {
        setAvailableTimesLoading(false);
      }
    },
    [
      fetchAvailableTimes,
      setAvailableTimesData,
      setAvailableTimesLoading,
      appointmentError,
      availableTimesData,
    ]
  );

  // Get available times for a specific chair
  const getAvailableTimes = useCallback(
    (chairId: number) => {
      if (!availableTimesData?.chairs) return [];

      const chairData = availableTimesData.chairs.find(
        (chair) => chair.chairId === chairId
      );
      if (!chairData) return [];

      // Combina horários disponíveis e indisponíveis com status
      const availableTimes = chairData.available.map((time) => ({
        time,
        available: true,
        reason: "Disponível",
      }));

      const unavailableTimes = chairData.unavailable.map((time) => ({
        time,
        available: false,
        reason: "Ocupado",
      }));

      // Combina e ordena por horário
      return [...availableTimes, ...unavailableTimes].sort((a, b) =>
        a.time.localeCompare(b.time)
      );
    },
    [availableTimesData]
  );

  const handleDateSelect = useCallback(async (date: string) => {
    setSelectedDate(date);
  }, []);

  const handleTimeSelect = useCallback(
    async (chairId: number, time: string) => {
      if (!selectedDate) return;

      const chairData = availableTimesData?.chairs?.find(
        (chair) => chair.chairId === chairId
      );
      if (!chairData) return;

      // Formatar a data e hora para exibição
      const { time: formattedTime } = formatDateTime(time);
      const formattedDate = new Date(selectedDate).toLocaleDateString("pt-BR");

      const confirmMessage = `Deseja realmente agendar uma sessão de massagem na ${chairData.chairName} para ${formattedDate} às ${formattedTime}?`;

      if (window.confirm(confirmMessage)) {
        setCreateLoading(true);
        try {
          const success = await createAppointment({
            chairId,
            datetimeStart: time,
          });

          if (success) {
            appointmentSuccess("Agendamento criado com sucesso!");
            // Refresh available times after successful booking
            await handleFetchAvailableTimes(selectedDate, 1);
          }
        } catch (error) {
          console.error("Erro ao criar agendamento:", error);
          appointmentError("Erro ao criar agendamento");
        } finally {
          setCreateLoading(false);
        }
      }
    },
    [
      selectedDate,
      availableTimesData,
      createAppointment,
      setCreateLoading,
      appointmentSuccess,
      appointmentError,
      handleFetchAvailableTimes,
    ]
  );

  const handleLoadMore = useCallback(async () => {
    if (availableTimesData?.pagination.hasNextPage && selectedDate) {
      await handleFetchAvailableTimes(
        selectedDate,
        availableTimesData.pagination.currentPage + 1
      );
    }
  }, [availableTimesData?.pagination, selectedDate, handleFetchAvailableTimes]);

  // Função para atualizar tudo quando clicar no botão atualizar
  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchChairs(), fetchSchedules()]);

    // Só buscar agendamentos se estivermos em uma seção que precisa deles
    if (
      activeSection === "my-appointments" ||
      activeSection === "scheduled-list"
    ) {
      await fetchAppointments();
    }

    // Se há uma data selecionada, atualizar também as cadeiras disponíveis
    if (selectedDate) {
      await handleFetchAvailableTimes(selectedDate, 1);
    }
  }, [
    selectedDate,
    activeSection,
    fetchChairs,
    fetchSchedules,
    fetchAppointments,
    handleFetchAvailableTimes,
  ]);

  // Função para atualizar agendamentos quando houver mudanças em outras seções
  const handleAppointmentChange = useCallback(async () => {
    // Só buscar agendamentos se estivermos em uma seção que precisa deles
    if (
      activeSection === "my-appointments" ||
      activeSection === "scheduled-list"
    ) {
      await fetchAppointments();
    }

    // Se há uma data selecionada, atualizar também as cadeiras disponíveis
    if (selectedDate) {
      await handleFetchAvailableTimes(selectedDate, 1);
    }
  }, [
    selectedDate,
    activeSection,
    fetchAppointments,
    handleFetchAvailableTimes,
  ]);

  const formatSelectedDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Loading específico para o grid de cadeiras
  const isGridLoading = availableTimesLoading;

  // Loading inicial (apenas na primeira carga)
  const isInitialLoading = chairsLoading || schedulesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendar Massagem</h1>
          <p className="text-gray-600">
            {activeSection === "schedule"
              ? "Selecione uma data e escolha o horário desejado"
              : activeSection === "my-appointments"
              ? "Visualize e gerencie seus agendamentos"
              : "Gerencie os agendamentos pendentes de confirmação"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeSection === "schedule" ? "default" : "outline"}
            onClick={() => setActiveSection("schedule")}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Agendar
          </Button>
          <Button
            variant={
              activeSection === "my-appointments" ? "default" : "outline"
            }
            onClick={() => setActiveSection("my-appointments")}
            className="flex items-center gap-2"
          >
            <ListIcon className="h-4 w-4" />
            Meus Agendamentos
          </Button>
          {user?.role === "admin" && (
            <Button
              variant={
                activeSection === "scheduled-list" ? "default" : "outline"
              }
              onClick={() => setActiveSection("scheduled-list")}
              className="flex items-center gap-2"
            >
              <UsersIcon className="h-4 w-4" />
              Lista de Agendamentos
            </Button>
          )}
        </div>
      </div>

      {/* Render appropriate section based on activeSection */}
      {activeSection === "schedule" ? (
        <>
          {/* Date Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selecionar Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setDatePickerOpen(true)}
                  className="flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate
                    ? formatSelectedDate(selectedDate)
                    : "Escolher data"}
                </Button>
                {selectedDate && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDate(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XIcon className="h-4 w-4" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chairs Grid */}
          {!selectedDate ? (
            <div className="text-center py-12">
              {isInitialLoading ? (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  Carregando...
                </div>
              ) : (
                <>
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione uma data
                  </h3>
                  <p className="text-gray-600">
                    Escolha uma data para ver as cadeiras disponíveis
                  </p>
                </>
              )}
            </div>
          ) : isGridLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Skeleton loading para as cadeiras */}
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-full animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, timeIndex) => (
                          <div
                            key={timeIndex}
                            className="h-12 bg-gray-200 rounded"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !availableTimesData?.chairs ||
            availableTimesData.chairs.length === 0 ? (
            <div className="text-center py-12">
              <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma cadeira disponível
              </h3>
              <p className="text-gray-600">
                Não há cadeiras ativas para {formatSelectedDate(selectedDate)}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTimesData.chairs.map((chairData) => (
                  <ChairCard
                    key={chairData.chairId}
                    chair={{
                      id: chairData.chairId,
                      name: chairData.chairName,
                      location: chairData.chairLocation || "",
                      status: "ACTIVE",
                      description: "",
                      createdAt: "",
                      updatedAt: "",
                      deletedAt: null,
                    }}
                    availableTimes={getAvailableTimes(chairData.chairId)}
                    onTimeSelect={handleTimeSelect}
                    createLoading={createLoading}
                    selectedDate={selectedDate}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {availableTimesData.pagination.totalItems > 3 && (
                <PaginationComponent
                  hasNextPage={availableTimesData.pagination.hasNextPage}
                  hasPrevPage={availableTimesData.pagination.hasPrevPage}
                  currentPage={availableTimesData.pagination.currentPage}
                  nextPage={availableTimesData.pagination.nextPage || 0}
                  prevPage={availableTimesData.pagination.prevPage || 0}
                  lastPage={availableTimesData.pagination.lastPage}
                  goToPage={handleFetchAvailableTimes}
                  selectedDate={selectedDate}
                />
              )}

              {/* Pagination Info */}
              {availableTimesData.pagination.totalItems > 0 && (
                <div className="text-center text-sm text-gray-600">
                  Mostrando {availableTimesData.chairs.length} de{" "}
                  {availableTimesData.pagination.totalItems} cadeiras
                </div>
              )}
            </>
          )}

          {/* Date Picker Modal */}
          <DatePickerModal
            open={datePickerOpen}
            onClose={() => setDatePickerOpen(false)}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </>
      ) : activeSection === "my-appointments" ? (
        <MyAppointmentsList onAppointmentChange={handleAppointmentChange} />
      ) : (
        <ScheduledAppointmentsList
          onAppointmentChange={handleAppointmentChange}
        />
      )}

      {/* Appointment Modal */}
      <AppointmentModal />
    </div>
  );
};
