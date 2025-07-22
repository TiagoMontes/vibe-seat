import { useCallback, useState } from "react";
import { useAtom } from "jotai";
import {
  schedulesAtom,
  scheduleFiltersAtom,
  filteredSchedulesAtom,
  schedulesByDayAtom,
} from "@/app/atoms/scheduleAtoms";
import { Schedule, ScheduleFormData, ScheduleUpdateFormData, ScheduleFilters } from "@/app/schemas/scheduleSchema";

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

  // Fetch all schedules
  const fetchSchedules = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/schedules/getAll", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao buscar configurações");
        }

        const data = await response.json();
        setSchedules(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        throw err;
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [setSchedules]
  );

  // Create new schedule
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
        
        // Add new schedules to the current list
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

  // Update schedule
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

        // Update the schedule in the current list
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

  // Delete schedule
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

        // Remove the schedule from the current list
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

  // Bulk delete schedules
  const bulkDeleteSchedules = useCallback(
    async (ids: number[]) => {
      setDeleteLoading(true);
      setError(null);

      console.log(ids);
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

        // Remove the schedules from the current list
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

  const deleteManySchedules = useCallback(
    async (ids: number[]) => {
      setDeleteLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/schedules/deleteMany/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ids),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao excluir configuração");
        }

        // Remove the schedule from the current list
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

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<ScheduleFilters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    [setFilters]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    schedules,
    filteredSchedules,
    schedulesByDay,
    filters,
    
    // Loading states
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Error state
    error,
    
    // Actions
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    bulkDeleteSchedules,
    updateFilters,
    resetFilters,
    clearError,
  };
}; 