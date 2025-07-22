"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  Timer,
  BarChart3,
  Filter,
  X,
} from "lucide-react";
import { useSchedules } from "@/app/hooks/useSchedules";
import {
  scheduleModalOpenAtom,
  scheduleEditModalOpenAtom,
  selectedScheduleAtom,
  computedScheduleStatsAtom,
} from "@/app/atoms/scheduleAtoms";
import {
  Schedule,
  getDayLabel,
  formatDateRange,
  isScheduleActive,
  generateTimeSlots,
} from "@/app/schemas/scheduleSchema";
import ScheduleModal from "@/app/components/ScheduleModal";
import ScheduleCalendar from "@/app/components/ScheduleCalendar";

type DayFilter = "all" | number;

const ScheduleManagement = () => {
  const [, setIsCreateModalOpen] = useAtom(scheduleModalOpenAtom);
  const [, setIsEditModalOpen] = useAtom(scheduleEditModalOpenAtom);
  const [, setSelectedSchedule] = useAtom(selectedScheduleAtom);
  const [scheduleStats] = useAtom(computedScheduleStatsAtom);

  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [specificDateFilter, setSpecificDateFilter] = useState("");

  const [selectedSchedules, setSelectedSchedules] = useState<Set<number>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const {
    schedules,
    loading,
    deleteLoading,
    error,
    fetchSchedules,
    updateFilters,
    resetFilters,
    deleteSchedule,
    bulkDeleteSchedules,
    clearError,
  } = useSchedules();

  useEffect(() => {
    fetchSchedules(true);
  }, [fetchSchedules]);

  useEffect(() => {
    updateFilters({
      dayOfWeek: dayFilter === "all" ? undefined : dayFilter,
      validDate: dateFilter || undefined,
    });
  }, [dayFilter, dateFilter, updateFilters]);

  const handleClearFilters = useCallback(() => {
    setDayFilter("all");
    setDateFilter("");
    setSpecificDateFilter("");
    resetFilters();
  }, [resetFilters]);

  const handleSpecificDateChange = useCallback((value: string) => {
    setSpecificDateFilter(value);
  }, []);

  const clearSpecificDateFilter = useCallback(() => {
    setSpecificDateFilter("");
  }, []);

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleDeleteSchedule = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta configuração?")) {
      try {
        await deleteSchedule(id);
      } catch (error) {
        alert("Erro ao excluir configuração");
        console.error(error);
      }
    }
  };

  const toggleScheduleSelection = (id: number) => {
    setSelectedSchedules((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const selectAllSchedules = () => {
    setSelectedSchedules(new Set(filteredSchedulesByDate.map((s) => s.id)));
  };

  const clearSelection = () => {
    setSelectedSchedules(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    if (selectedSchedules.size === 0) return;

    const count = selectedSchedules.size;
    if (
      window.confirm(
        `Tem certeza que deseja excluir ${count} configuração(ões) selecionada(s)?`
      )
    ) {
      try {
        await bulkDeleteSchedules(Array.from(selectedSchedules));
        clearSelection();
      } catch (error) {
        alert("Erro ao excluir configurações");
        console.error(error);
      }
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      clearSelection();
    }
  };

  const getStatusIcon = (schedule: Schedule) => {
    return isScheduleActive(schedule) ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusText = (schedule: Schedule) => {
    return isScheduleActive(schedule) ? "Ativo" : "Inativo";
  };

  const getStatusColorClass = (schedule: Schedule) => {
    return isScheduleActive(schedule)
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getSchedulesForSpecificDate = useCallback(
    (date: string) => {
      if (!date) return schedules;

      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();

      return schedules.filter((schedule) => {
        if (schedule.dayOfWeek !== dayOfWeek) return false;

        return true;
      });
    },
    [schedules]
  );

  const filteredSchedulesByDate = specificDateFilter
    ? getSchedulesForSpecificDate(specificDateFilter)
    : schedules;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-black" />
          <div>
            <h1 className="text-3xl font-bold text-black">
              Gestão de Disponibilidade
            </h1>
            <p className="text-gray-600">
              Configure os dias e horários disponíveis para agendamento
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Horário
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <Button variant="outline" size="sm" onClick={clearError}>
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[
          {
            key: "total",
            label: "Total de Configurações",
            value: scheduleStats.total,
            icon: Calendar,
            valueColor: "text-black",
            iconColor: "text-gray-400",
          },
          {
            key: "activePeriods",
            label: "Dias Ativos",
            value: scheduleStats.activePeriods,
            icon: CalendarDays,
            valueColor: "text-green-600",
            iconColor: "text-green-400",
          },
          {
            key: "totalSlots",
            label: "Total de Slots",
            value: scheduleStats.totalSlots,
            icon: Timer,
            valueColor: "text-blue-600",
            iconColor: "text-blue-400",
          },
          {
            key: "averageSlots",
            label: "Média de Slots por Dia",
            value: scheduleStats.averageSlotsPerDay,
            icon: BarChart3,
            valueColor: "text-purple-600",
            iconColor: "text-purple-400",
          },
        ].map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.key} className="border border-gray-200">
              <CardContent className="p-4 h-[100px] flex items-center">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col justify-center min-h-[52px]">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <div className="w-16 h-8 flex items-center">
                      <p
                        className={`text-2xl font-bold ${stat.valueColor} tabular-nums leading-none`}
                      >
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <IconComponent className={`h-8 w-8 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ScheduleCalendar
        schedules={schedules}
        onCreateSchedule={() => setIsCreateModalOpen(true)}
        onEditSchedule={handleEditSchedule}
      />

      {specificDateFilter && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-blue-600" />
                <div>
                  <span className="font-medium text-blue-800">
                    Filtrando por:{" "}
                    {new Date(specificDateFilter).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <p className="text-sm text-blue-700">
                    Mostrando {filteredSchedulesByDate.length} configuração(ões)
                    para este dia
                  </p>
                </div>
              </div>
              <Button
                onClick={clearSpecificDateFilter}
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-300"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar Filtro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-black">
                Lista Detalhada
              </h2>
              {isSelectionMode && selectedSchedules.size > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="w-4 h-4" checked readOnly />
                  <span className="font-medium text-blue-800">
                    {selectedSchedules.size} selecionado(s)
                  </span>
                  <span className="text-blue-700">
                    (
                    {Array.from(selectedSchedules)
                      .map((id) => {
                        const schedule = filteredSchedulesByDate.find(
                          (s) => s.id === id
                        );
                        return schedule ? getDayLabel(schedule.dayOfWeek) : "";
                      })
                      .filter(Boolean)
                      .slice(0, 3)
                      .join(", ")}
                    {selectedSchedules.size > 3 && "..."})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-600" />
                <Input
                  type="date"
                  value={specificDateFilter}
                  onChange={(e) => handleSpecificDateChange(e.target.value)}
                  className="w-40"
                  placeholder="Filtrar por data"
                />
              </div>

              {!isSelectionMode ? (
                <Button
                  onClick={toggleSelectionMode}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <input type="checkbox" className="w-4 h-4" readOnly />
                  Selecionar
                </Button>
              ) : (
                <>
                  <Button
                    onClick={selectAllSchedules}
                    variant="outline"
                    size="sm"
                  >
                    Selecionar Todos ({filteredSchedulesByDate.length})
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    variant="destructive"
                    size="sm"
                    disabled={selectedSchedules.size === 0 || deleteLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir ({selectedSchedules.size})
                  </Button>
                  <Button onClick={clearSelection} variant="outline" size="sm">
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {filteredSchedulesByDate.length === 0 && !loading ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              {specificDateFilter ? (
                <>
                  <p className="text-gray-500">
                    Nenhuma configuração encontrada para esta data
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(specificDateFilter).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <Button
                    onClick={clearSpecificDateFilter}
                    variant="outline"
                    className="mt-4"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover Filtro
                  </Button>
                </>
              ) : schedules.length === 0 ? (
                <>
                  <p className="text-gray-500">
                    Nenhuma configuração de horário
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira configuração
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-500">
                    Nenhuma configuração encontrada
                  </p>
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="mt-4"
                  >
                    Limpar Filtros
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSchedulesByDate.map((schedule) => {
                const slots = generateTimeSlots(
                  schedule.timeStart,
                  schedule.timeEnd
                );
                const isSelected = selectedSchedules.has(schedule.id);

                return (
                  <Card
                    key={schedule.id}
                    className={`border transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {isSelectionMode && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleScheduleSelection(schedule.id)
                              }
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                          )}
                          <Clock className="h-5 w-5 text-gray-600" />
                          <div>
                            <h3 className="font-semibold text-black">
                              {getDayLabel(schedule.dayOfWeek)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {schedule.timeStart} - {schedule.timeEnd}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(
                            schedule
                          )}`}
                        >
                          {getStatusIcon(schedule)}
                          {getStatusText(schedule)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Período de Validade:
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDateRange(
                              schedule.validFrom,
                              schedule.validTo
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Slots de 30min:
                          </p>
                          <p className="text-sm text-gray-600">
                            {slots.length} slots disponíveis
                          </p>
                        </div>
                      </div>

                      {/* Time Slots Preview */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Horários Disponíveis:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {slots.slice(0, 8).map((slot, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {slot}
                            </span>
                          ))}
                          {slots.length > 8 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{slots.length - 8} mais
                            </span>
                          )}
                        </div>
                      </div>

                      {!isSelectionMode && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEditSchedule(schedule)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>

                          <Button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            size="sm"
                            variant="destructive"
                            disabled={deleteLoading}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ScheduleModal />
    </div>
  );
};

export default ScheduleManagement;
