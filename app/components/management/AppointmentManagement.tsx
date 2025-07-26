"use client";

import { useEffect, useState, useCallback } from "react";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { useAppointments } from "@/app/hooks/useAppointments";
import { useChairs } from "@/app/hooks/useChairs";
import { useSchedules } from "@/app/hooks/useSchedules";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { useConfirm } from "@/app/hooks/useConfirm";
import {
  availableTimesAtom,
  availableTimesLoadingAtom,
  appointmentCreateLoadingAtom,
} from "@/app/atoms/appointmentAtoms";
import { Chair } from "@/app/types/api";
import { MyAppointmentsList } from "@/app/components/subTab/MyAppointmentsList";
import { ScheduledAppointmentsList } from "@/app/components/subTab/ScheduledAppointmentsList";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  XIcon,
  ListIcon,
  UsersIcon,
} from "lucide-react";
import { PaginationComponent } from "@/app/components/PaginationComponent";
import { AppointmentModal } from "@/app/components/modal/AppointmentModal";
import { GenericFilter } from "@/app/components/GenericFilter";

interface ChairCardProps {
  chair: Chair;
  availableTimes: Array<{ time: string; available: boolean; reason?: string }>;
  onTimeSelect: (chairId: number, time: string) => void;
  createLoading: boolean;
  selectedDate?: Date | undefined;
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

    // Formata o horário para hh:mm - tratando como UTC
    const formattedTime = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC", // Força o uso de UTC
    });

    return {
      date: formattedDate,
      time: formattedTime,
    };
  } catch (error) {
    console.error("Erro ao formatar data e hora:", error);
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
    <Card className="h-full border border-gray-200 p-2 sm:p-4 flex flex-col justify-between">
      <CardHeader className="pb-2 sm:pb-3 px-0 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          {chair.name}
        </CardTitle>
        {chair.location && (
          <p className="text-xs sm:text-sm text-gray-600">{chair.location}</p>
        )}
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
            <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            Horários disponíveis
          </div>

          {availableTimes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
              {availableTimes.map((timeSlot) => {
                // Usa a função para formatar o datetime
                const { time } = formatDateTime(timeSlot.time);

                return (
                  <button
                    key={timeSlot.time}
                    onClick={() => onTimeSelect(chair.id, timeSlot.time)}
                    disabled={createLoading || !timeSlot.available}
                    className={`p-2 sm:p-3 text-xs sm:text-sm rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
            <p className="text-xs sm:text-sm text-gray-500 text-center py-3 sm:py-4">
              Nenhum horário disponível
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ChairCardSkeleton = () => {
  return (
    <Card className="h-full border border-gray-200 p-2 sm:p-4 flex flex-col justify-between">
      <CardHeader className="pb-2 sm:pb-3 px-0 sm:px-6">
        <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 animate-pulse mt-1"></div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
            {Array.from({ length: 6 }).map((_, timeIndex) => (
              <div
                key={timeIndex}
                className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AppointmentManagement = () => {
  const { user } = useAuth();
  const { fetchChairs, loading: chairsLoading } = useChairs();
  const { fetchSchedules, loading: schedulesLoading } = useSchedules();
  const {
    createAppointment,
    fetchAppointments,
    fetchAvailableTimes,
    fetchMyAppointments,
  } = useAppointments();
  const { appointmentSuccess, appointmentError } = useToast();
  const { confirm, ConfirmComponent } = useConfirm();

  // Atoms do Jotai
  const [availableTimesData, setAvailableTimesData] =
    useAtom(availableTimesAtom);
  const [availableTimesLoading, setAvailableTimesLoading] = useAtom(
    availableTimesLoadingAtom
  );
  const [createLoading, setCreateLoading] = useAtom(
    appointmentCreateLoadingAtom
  );

  // New state for chairs loading and availability loading
  const [chairsData, setChairsData] = useState<any>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Local state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeSection, setActiveSection] = useState<
    "schedule" | "my-appointments" | "scheduled-list"
  >("schedule");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Filter state
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [isSearchPending, setIsSearchPending] = useState(false);

  // Fetch chairs and schedules on mount - apenas uma vez
  useEffect(() => {
    const loadInitialData = async () => {
      if (isFirstLoad) {
        await Promise.all([fetchChairs(), fetchSchedules()]);
        setIsFirstLoad(false);
      }
    };

    loadInitialData();
  }, [isFirstLoad]); // Remove fetchChairs e fetchSchedules da dependência

  // Function to fetch chairs with pagination and filters
  const handleFetchChairs = useCallback(
    async (date: string, page: number = 1, append: boolean = false, filters?: { search?: string; sortBy?: string }) => {
      setAvailableTimesLoading(true);
      try {
        const currentSearch = filters?.search || searchValue || "";
        const currentSort = filters?.sortBy || sortValue || "newest";
        
        // First, get sorted and filtered chairs from chairs API
        const chairFilters = {
          page,
          limit: 3,
          search: currentSearch,
          status: "", // Empty to get all active chairs
          sortBy: currentSort
        };
        
        const chairsResult = await fetchChairs(chairFilters);
        
        // If no chairs found, return empty result
        if (!chairsResult.chairs || chairsResult.chairs.length === 0) {
          const emptyData = {
            chairs: [],
            pagination: chairsResult.pagination
          };
          
          setChairsData(emptyData);
          setAvailableTimesData(emptyData);
          return;
        }
        
        // Update chairs data
        setChairsData((prevData: any) => {
          if (append && prevData?.chairs) {
            return {
              ...chairsResult,
              chairs: [...prevData.chairs, ...chairsResult.chairs],
            };
          } else {
            return chairsResult;
          }
        });
        
        // Now fetch availability for these specific chairs
        setAvailabilityLoading(true);
        const chairIds = chairsResult.chairs.map((chair: any) => chair.id);
        const availableTimesData = await fetchAvailableTimes(date, chairIds);
        
        // Combine chair data with available times data
        const combinedChairs = chairsResult.chairs?.map((chair: any) => {
          // Find matching chair in available times data
          const availableTimesChair = availableTimesData.chairs?.find(
            (atChair: { chairId: number; available?: string[]; unavailable?: string[] }) => atChair.chairId === chair.id
          );
          
          return {
            chairId: chair.id,
            chairName: chair.name,
            chairLocation: chair.location,
            available: availableTimesChair?.available || [],
            unavailable: availableTimesChair?.unavailable || []
          };
        }) || [];
        
        const transformedData = {
          chairs: combinedChairs,
          pagination: chairsResult.pagination
        };
        
        setAvailableTimesData((prevData) => {
          if (append && prevData?.chairs) {
            // Adiciona novas cadeiras às existentes
            return {
              ...transformedData,
              chairs: [...prevData.chairs, ...transformedData.chairs],
            };
          } else {
            // Substitui as cadeiras existentes
            return transformedData;
          }
        });
        
      } catch (error) {
        console.error("Erro ao buscar cadeiras e horários disponíveis:", error);
        appointmentError("Erro ao buscar cadeiras e horários disponíveis");
      } finally {
        setAvailableTimesLoading(false);
        setAvailabilityLoading(false);
      }
    },
    [
      fetchChairs,
      fetchAvailableTimes,
      searchValue,
      sortValue,
      setAvailableTimesData,
      setAvailableTimesLoading,
      appointmentError,
    ]
  );

  // Fetch chairs and available times when date is selected
  useEffect(() => {
    if (selectedDate) {
      // Convert Date to ISO string format for API
      const dateStr = selectedDate.toISOString().split("T")[0];
      handleFetchChairs(dateStr, 1, false, {
        search: searchValue,
        sortBy: sortValue
      });
    } else {
      setChairsData(null);
      setAvailableTimesData(null);
    }
  }, [selectedDate, searchValue, sortValue]); // Add filter dependencies

  // Sincronizar estado quando mudar de seção - apenas quando necessário
  useEffect(() => {
    // Atualizar agendamentos apenas quando mudar para seções que precisam dos dados
    if (
      activeSection === "my-appointments" ||
      activeSection === "scheduled-list"
    ) {
      fetchAppointments();
    }
  }, [activeSection]); // Remove fetchAppointments da dependência

  // Get available times for a specific chair
  const getAvailableTimes = (chairId: number) => {
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
  };

  const handleTimeSelect = useCallback(
    async (chairId: number, time: string) => {
      if (!selectedDate) return;

      const chairData = availableTimesData?.chairs?.find(
        (chair) => chair.chairId === chairId
      );
      if (!chairData) return;

      // Formatar a data e hora para exibição
      const { time: formattedTime } = formatDateTime(time);
      const formattedDate = selectedDate.toLocaleDateString("pt-BR");

      const confirmed = await confirm({
        title: "Confirmar Agendamento",
        description: `Deseja realmente agendar uma sessão de massagem na ${chairData.chairName} para ${formattedDate} às ${formattedTime}?`,
        confirmText: "Agendar",
        cancelText: "Cancelar",
        destructive: false,
      });

      if (confirmed) {
        setCreateLoading(true);
        try {
          const success = await createAppointment({
            chairId,
            datetimeStart: time,
          });

          if (success) {
            appointmentSuccess("Agendamento criado com sucesso!");
            // Refresh available times after successful booking
            const dateStr = selectedDate.toISOString().split("T")[0];
            await handleFetchChairs(dateStr, 1);
          }
        } catch (error) {
          console.error("Erro ao criar agendamento:", error);
          appointmentError("Erro ao criar agendamento");
        } finally {
          setCreateLoading(false);
        }
      }
    },
    [selectedDate, availableTimesData, confirm] // Simplifica as dependências
  );

  // Função para atualizar agendamentos quando houver mudanças em outras seções
  const handleAppointmentChange = useCallback(async () => {
    // Só buscar agendamentos se estivermos em uma seção que precisa deles
    if (
      activeSection === "my-appointments" ||
      activeSection === "scheduled-list"
    ) {
      if (activeSection === "my-appointments") {
        await fetchMyAppointments();
      } else {
        await fetchAppointments();
      }
    }

    // Se há uma data selecionada, atualizar também as cadeiras disponíveis
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      handleFetchChairs(dateStr, 1);
    }
  }, [
    selectedDate,
    activeSection,
    fetchMyAppointments,
    fetchAppointments,
    fetchAvailableTimes,
    setAvailableTimesData,
    setAvailableTimesLoading,
    appointmentError,
  ]);

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  // Filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setIsSearchPending(true);
    setSearchValue(value);
    setTimeout(() => setIsSearchPending(false), 500);
  }, []);


  const handleSortChange = useCallback((value: string) => {
    setSortValue(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchValue("");
    setSortValue("newest");
  }, []);

  const hasActiveFilters = searchValue !== "" || sortValue !== "newest";

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Mais Recente" },
    { value: "oldest", label: "Mais Antigo" },
    { value: "name", label: "Nome A-Z" },
    { value: "name_desc", label: "Nome Z-A" }
  ];

  // Loading específico para o grid de cadeiras
  const isGridLoading = availableTimesLoading;

  // Loading inicial (apenas na primeira carga)
  const isInitialLoading = chairsLoading || schedulesLoading;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Agendar Massagem
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {activeSection === "schedule"
              ? "Selecione uma data e escolha o horário desejado"
              : activeSection === "my-appointments"
              ? "Visualize e gerencie seus agendamentos"
              : "Gerencie os agendamentos pendentes de confirmação"}
          </p>
        </div>

        {/* Navigation Buttons - Mobile First Design */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant={activeSection === "schedule" ? "default" : "outline"}
            onClick={() => setActiveSection("schedule")}
            className="flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto"
          >
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            Agendar
          </Button>
          <Button
            variant={
              activeSection === "my-appointments" ? "default" : "outline"
            }
            onClick={() => setActiveSection("my-appointments")}
            className="flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto"
          >
            <ListIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            Meus Agendamentos
          </Button>
          {user?.role === "admin" && (
            <Button
              variant={
                activeSection === "scheduled-list" ? "default" : "outline"
              }
              onClick={() => setActiveSection("scheduled-list")}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto"
            >
              <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4" />
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
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">
                Selecionar Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <DatePicker
                  date={selectedDate}
                  onDateChange={setSelectedDate}
                  placeholder="Selecionar data"
                  disablePastDates={true}
                  className="w-full sm:w-auto"
                />
                {selectedDate && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDate(undefined)}
                    className="text-red-600 hover:text-red-700 flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto"
                  >
                    <XIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filter Component */}
          {selectedDate && (
            <GenericFilter
              searchPlaceholder="Buscar cadeira por nome..."
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              isSearchPending={isSearchPending}
              sortOptions={sortOptions}
              sortValue={sortValue}
              onSortChange={handleSortChange}
              sortLabel="Ordenar por"
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
              showClearButton={true}
            />
          )}

          {/* Chairs Grid */}
          {!selectedDate ? (
            <div className="text-center py-8 sm:py-12">
              {isInitialLoading ? (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
                  <span className="text-sm sm:text-base">Carregando...</span>
                </div>
              ) : (
                <>
                  <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Selecione uma data
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Escolha uma data para ver as cadeiras disponíveis
                  </p>
                </>
              )}
            </div>
          ) : isGridLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {/* Skeleton loading para as cadeiras */}
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-full animate-pulse">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
                        {Array.from({ length: 6 }).map((_, timeIndex) => (
                          <div
                            key={timeIndex}
                            className="h-10 sm:h-12 bg-gray-200 rounded"
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
            <div className="text-center py-8 sm:py-12">
              <MapPinIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Nenhuma cadeira disponível
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Não há cadeiras ativas para {formatSelectedDate(selectedDate)}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {chairsData?.chairs && chairsData.chairs.map((chair: any) => {
                  // Check if we have availability data for this chair
                  const chairAvailabilityData = availableTimesData?.chairs?.find(
                    (chairData: any) => chairData.chairId === chair.id
                  );
                  
                  if (availabilityLoading || !chairAvailabilityData) {
                    // Show chair with skeleton loading for availability
                    return (
                      <Card key={chair.id} className="h-full border border-gray-200 p-2 sm:p-4 flex flex-col justify-between">
                        <CardHeader className="pb-2 sm:pb-3 px-0 sm:px-6">
                          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            {chair.name}
                          </CardTitle>
                          {chair.location && (
                            <p className="text-xs sm:text-sm text-gray-600">{chair.location}</p>
                          )}
                        </CardHeader>
                        <CardContent className="px-0 sm:px-6">
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                              <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              Carregando horários...
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
                              {Array.from({ length: 6 }).map((_, timeIndex) => (
                                <div
                                  key={timeIndex}
                                  className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse"
                                ></div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  return (
                    <ChairCard
                      key={chair.id}
                      chair={{
                        id: chair.id,
                        name: chair.name,
                        location: chair.location || "",
                        status: "ACTIVE",
                        description: "",
                        createdAt: "",
                        updatedAt: "",
                        deletedAt: null,
                      }}
                      availableTimes={getAvailableTimes(chair.id)}
                      onTimeSelect={handleTimeSelect}
                      createLoading={createLoading}
                      selectedDate={selectedDate}
                    />
                  );
                })}
                
                {/* If we don't have chairs data yet but we're not loading, show skeletons */}
                {!chairsData?.chairs && availableTimesLoading && (
                  Array.from({ length: 3 }).map((_, index) => (
                    <ChairCardSkeleton key={index} />
                  ))
                )}
              </div>

              {/* Load More Button */}
              {availableTimesData.pagination.totalItems > 3 && (
                <div className="px-2 sm:px-0">
                  <PaginationComponent
                    hasNextPage={availableTimesData.pagination.hasNextPage}
                    hasPrevPage={availableTimesData.pagination.hasPrevPage}
                    currentPage={availableTimesData.pagination.currentPage}
                    nextPage={availableTimesData.pagination.nextPage || 0}
                    prevPage={availableTimesData.pagination.prevPage || 0}
                    lastPage={availableTimesData.pagination.lastPage}
                    goToPage={handleFetchChairs}
                    selectedDate={
                      selectedDate
                        ? selectedDate.toISOString().split("T")[0]
                        : ""
                    }
                  />
                </div>
              )}

              {/* Pagination Info */}
              {availableTimesData.pagination.totalItems > 0 && (
                <div className="text-center text-xs sm:text-sm text-gray-600">
                  Mostrando {availableTimesData.chairs.length} de{" "}
                  {availableTimesData.pagination.totalItems} cadeiras
                </div>
              )}
            </>
          )}
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
      <ConfirmComponent />
    </div>
  );
};
