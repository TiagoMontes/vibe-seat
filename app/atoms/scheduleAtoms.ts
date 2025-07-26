import { atom } from "jotai";
import { Schedule as ApiSchedule } from "@/app/types/api";
import { Schedule, ScheduleStats, ScheduleFilters, calculateTimeSlots, isScheduleActive } from "@/app/schemas/scheduleSchema";

// ===== ESTADOS PRINCIPAIS =====

// Modal state atoms
export const scheduleModalOpenAtom = atom(false);
export const scheduleEditModalOpenAtom = atom(false);
export const selectedScheduleAtom = atom<ApiSchedule | null>(null);

// Data atoms
export const schedulesAtom = atom<Schedule[]>([]);
export const scheduleFiltersAtom = atom<ScheduleFilters>({});

// Estado principal do schedule (para compatibilidade com o código existente)
export const currentScheduleAtom = atom<ApiSchedule | undefined>(undefined);

// ===== ESTADOS DE LOADING =====
export const schedulesLoadingAtom = atom<boolean>(false);
export const scheduleCreateLoadingAtom = atom<boolean>(false);
export const scheduleUpdateLoadingAtom = atom<boolean>(false);
export const scheduleDeleteLoadingAtom = atom<boolean>(false);
export const schedulesErrorAtom = atom<string>("");

// ===== ATOMS PARA OPERAÇÕES =====

// Trigger para forçar atualizações
export const schedulesUpdateTriggerAtom = atom<number>(0);

// Função para incrementar o trigger
export const incrementSchedulesUpdateTriggerAtom = atom(
  null,
  (get, set) => {
    const current = get(schedulesUpdateTriggerAtom);
    set(schedulesUpdateTriggerAtom, current + 1);
  }
);

// ===== ATOMS DERIVADOS =====

// Estado combinado de loading (qualquer operação)
export const isAnyScheduleLoadingAtom = atom((get) => {
  return get(schedulesLoadingAtom) || 
         get(scheduleCreateLoadingAtom) || 
         get(scheduleUpdateLoadingAtom) || 
         get(scheduleDeleteLoadingAtom);
});

// Computed stats atom
export const computedScheduleStatsAtom = atom<ScheduleStats>((get) => {
  const schedules = get(schedulesAtom);
  
  const activeSchedules = schedules.filter(isScheduleActive);
  const totalSlots = schedules.reduce((sum, schedule) => {
    return sum + calculateTimeSlots(schedule.timeStart, schedule.timeEnd);
  }, 0);
  
  // Group by day to count active periods (unique days with active schedules)
  const activeDays = new Set(activeSchedules.map(s => s.dayOfWeek));
  
  return {
    total: schedules.length,
    activePeriods: activeDays.size,
    totalSlots,
    averageSlotsPerDay: activeDays.size > 0 ? Math.round(totalSlots / activeDays.size * 10) / 10 : 0,
  };
});

// Filtered schedules atom
export const filteredSchedulesAtom = atom((get) => {
  const schedules = get(schedulesAtom);
  const filters = get(scheduleFiltersAtom);
  
  return schedules.filter((schedule) => {
    // Filter by day of week
    if (filters.dayOfWeek !== undefined && schedule.dayOfWeek !== filters.dayOfWeek) {
      return false;
    }
    
    // Filter by valid date
    if (filters.validDate) {
      const filterDate = new Date(filters.validDate);
      const validFrom = schedule.validFrom ? new Date(schedule.validFrom) : null;
      const validTo = schedule.validTo ? new Date(schedule.validTo) : null;
      
      if (validFrom && filterDate < validFrom) return false;
      if (validTo && filterDate > validTo) return false;
    }
    
    return true;
  });
});

// Group schedules by day of week
export const schedulesByDayAtom = atom((get) => {
  const schedules = get(filteredSchedulesAtom);
  
  const grouped: Record<number, Schedule[]> = {};
  
  schedules.forEach((schedule) => {
    if (!grouped[schedule.dayOfWeek]) {
      grouped[schedule.dayOfWeek] = [];
    }
    grouped[schedule.dayOfWeek].push(schedule);
  });
  
  // Sort schedules within each day by time
  Object.keys(grouped).forEach((day) => {
    grouped[parseInt(day)].sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  });
  
  return grouped;
}); 