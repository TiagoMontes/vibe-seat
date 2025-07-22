import { atom } from "jotai";
import { Schedule, ScheduleStats, ScheduleFilters, calculateTimeSlots, isScheduleActive } from "@/app/schemas/scheduleSchema";

// Modal state atoms
export const scheduleModalOpenAtom = atom(false);
export const scheduleEditModalOpenAtom = atom(false);
export const selectedScheduleAtom = atom<Schedule | null>(null);

// Data atoms
export const schedulesAtom = atom<Schedule[]>([]);
export const scheduleFiltersAtom = atom<ScheduleFilters>({});

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