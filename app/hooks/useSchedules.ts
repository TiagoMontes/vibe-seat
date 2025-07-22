import { useCallback, useState } from "react";
import { useAtom } from "jotai";
import {
  schedulesAtom,
  scheduleFiltersAtom,
  filteredSchedulesAtom,
  schedulesByDayAtom,
} from "@/app/atoms/scheduleAtoms";
import { ScheduleFormData, ScheduleUpdateFormData, ScheduleFilters, generateTimeSlots } from "@/app/schemas/scheduleSchema";

export const useSchedules = () => {
  const [schedules, setSchedules] = useAtom(schedulesAtom);
  const [filters, setFilters] = useAtom(scheduleFiltersAtom);
  const [filteredSchedules] = useAtom(filteredSchedulesAtom);
  const [schedulesByDay] = useAtom(schedulesByDayAtom);

  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/schedules/getAll");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar configurações de horário");
      }

      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [setSchedules, setLoading, setError]);

  const createSchedule = useCallback(
    async (scheduleData: ScheduleFormData) => {
      setCreateLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/schedules/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scheduleData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao criar configuração");
        }

        const newSchedules = await response.json();
        
        setSchedules(prev => [...prev, ...newSchedules]);
        
        return newSchedules;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        throw err;
      } finally {
        setCreateLoading(false);
      }
    },
    [setSchedules]
  );

  const updateSchedule = useCallback(
    async (id: number, scheduleData: ScheduleUpdateFormData) => {
      setUpdateLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/schedules/update/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scheduleData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao atualizar configuração");
        }

        const updatedSchedule = await response.json();

        setSchedules(prev =>
          prev.map(schedule =>
            schedule.id === id ? updatedSchedule : schedule
          )
        );

        return updatedSchedule;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        throw err;
      } finally {
        setUpdateLoading(false);
      }
    },
    [setSchedules]
  );

  const deleteSchedule = useCallback(
    async (id: number) => {
      setDeleteLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/schedules/delete/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao excluir configuração");
        }

        setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        throw err;
      } finally {
        setDeleteLoading(false);
      }
    },
    [setSchedules]
  );

  const bulkDeleteSchedules = useCallback(
    async (ids: number[]) => {
      setDeleteLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/schedules/bulk-delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao excluir configurações");
        }

        setSchedules(prev => prev.filter(schedule => !ids.includes(schedule.id)));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        throw err;
      } finally {
        setDeleteLoading(false);
      }
    },
    [setSchedules]
  );

  const getAvailableTimesForDate = useCallback((date: string): string[] => {
    if (!schedules || schedules.length === 0) {
      return [];
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const validSchedules = schedules.filter((schedule) => {
      if (schedule.dayOfWeek !== dayOfWeek) {
        return false;
      }

      const validFrom = schedule.validFrom ? new Date(schedule.validFrom) : null;
      const validTo = schedule.validTo ? new Date(schedule.validTo) : null;

      if (!validFrom || !validTo) return false;

      return selectedDate >= validFrom && selectedDate <= validTo;
    });

    const allTimeSlots: string[] = [];

    validSchedules.forEach((schedule) => {
      const timeSlots = generateTimeSlots(schedule.timeStart, schedule.timeEnd);
      allTimeSlots.push(...timeSlots);
    });

    const uniqueTimeSlots = [...new Set(allTimeSlots)].sort();

    return uniqueTimeSlots;
  }, [schedules]);

  const updateFilters = useCallback(
    (newFilters: Partial<ScheduleFilters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    [setFilters]
  );

  const resetFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasAvailableSchedules = useCallback((date: string): boolean => {
    return getAvailableTimesForDate(date).length > 0
  }, [getAvailableTimesForDate]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    bulkDeleteSchedules,
    createLoading,
    updateLoading,
    deleteLoading,
    clearError,
    updateFilters,
    resetFilters,
    getAvailableTimesForDate,
    hasAvailableSchedules
  };
}; 