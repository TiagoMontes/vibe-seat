import * as yup from "yup";

// Time validation regex (HH:MM format)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const scheduleSchema = yup.object({
  daysOfWeek: yup
    .array()
    .of(yup.number().required().min(0).max(6))
    .min(1, "Selecione pelo menos um dia da semana")
    .required("Dias da semana são obrigatórios"),
  timeStart: yup
    .string()
    .matches(timeRegex, "Formato de horário inválido (HH:MM)")
    .required("Horário de início é obrigatório"),
  timeEnd: yup
    .string()
    .matches(timeRegex, "Formato de horário inválido (HH:MM)")
    .required("Horário de fim é obrigatório")
    .test("is-after-start", "Horário de fim deve ser após o início", function(value) {
      const { timeStart } = this.parent;
      if (!timeStart || !value) return true;
      return value > timeStart;
    }),
  validFrom: yup
    .mixed()
    .nullable()
    .test("is-valid-date", "Data inválida", function(value) {
      if (!value) return true;
      if (typeof value === 'string') {
        return !isNaN(Date.parse(value));
      }
      return value instanceof Date && !isNaN(value.getTime());
    }),
  validTo: yup
    .mixed()
    .nullable()
    .test("is-valid-date", "Data inválida", function(value) {
      if (!value) return true;
      if (typeof value === 'string') {
        return !isNaN(Date.parse(value));
      }
      return value instanceof Date && !isNaN(value.getTime());
    })
    .test("is-after-from", "Data fim deve ser após data início", function(value) {
      const { validFrom } = this.parent;
      if (!validFrom || !value) return true;
      
      const fromDate = typeof validFrom === 'string' ? new Date(validFrom) : validFrom;
      const toDate = typeof value === 'string' ? new Date(value) : value;
      
      return toDate >= fromDate;
    }),
});

export const scheduleUpdateSchema = yup.object({
  dayOfWeek: yup.number().min(0).max(6),
  timeStart: yup.string().matches(timeRegex, "Formato de horário inválido (HH:MM)"),
  timeEnd: yup
    .string()
    .matches(timeRegex, "Formato de horário inválido (HH:MM)")
    .test("is-after-start", "Horário de fim deve ser após o início", function(value) {
      const { timeStart } = this.parent;
      if (!timeStart || !value) return true;
      return value > timeStart;
    }),
  validFrom: yup
    .mixed()
    .nullable()
    .test("is-valid-date", "Data inválida", function(value) {
      if (!value) return true;
      if (typeof value === 'string') {
        return !isNaN(Date.parse(value));
      }
      return value instanceof Date && !isNaN(value.getTime());
    }),
  validTo: yup
    .mixed()
    .nullable()
    .test("is-valid-date", "Data inválida", function(value) {
      if (!value) return true;
      if (typeof value === 'string') {
        return !isNaN(Date.parse(value));
      }
      return value instanceof Date && !isNaN(value.getTime());
    })
    .test("is-after-from", "Data fim deve ser após data início", function(value) {
      const { validFrom } = this.parent;
      if (!validFrom || !value) return true;
      return value >= validFrom;
    }),
});

// Novos schemas para a estrutura real da API
export const timeRangeSchema = yup.object({
  start: yup
    .string()
    .matches(timeRegex, "Formato de horário inválido (HH:MM)")
    .required("Horário de início é obrigatório"),
  end: yup
    .string()
    .matches(timeRegex, "Formato de horário inválido (HH:MM)")
    .required("Horário de fim é obrigatório")
    .test("is-after-start", "Horário de fim deve ser após o início", function(value) {
      const { start } = this.parent;
      if (!start || !value) return true;
      return value > start;
    }),
});

export const apiScheduleSchema = yup.object({
  timeRanges: yup
    .array()
    .of(timeRangeSchema)
    .min(1, "Adicione pelo menos um intervalo de horário")
    .required("Intervalos de horário são obrigatórios"),
  validFrom: yup
    .mixed()
    .nullable()
    .test("is-valid-date", "Data inválida", function(value) {
      if (!value) return true;
      if (typeof value === 'string') {
        return !isNaN(Date.parse(value));
      }
      return value instanceof Date && !isNaN(value.getTime());
    }),
  validTo: yup
    .mixed()
    .nullable()
    .test("is-valid-date", "Data inválida", function(value) {
      if (!value) return true;
      if (typeof value === 'string') {
        return !isNaN(Date.parse(value));
      }
      return value instanceof Date && !isNaN(value.getTime());
    })
    .test("is-after-from", "Data fim deve ser após data início", function(value) {
      const { validFrom } = this.parent;
      if (!validFrom || !value) return true;
      
      const fromDate = typeof validFrom === 'string' ? new Date(validFrom) : validFrom;
      const toDate = typeof value === 'string' ? new Date(value) : value;
      
      return toDate >= fromDate;
    }),
  dayIds: yup
    .array()
    .of(yup.number().required().min(1))
    .min(1, "Selecione pelo menos um dia da semana")
    .required("Dias da semana são obrigatórios"),
});

export type ScheduleFormData = yup.InferType<typeof scheduleSchema>;
export type ScheduleUpdateFormData = yup.InferType<typeof scheduleUpdateSchema>;
export type ApiScheduleFormData = yup.InferType<typeof apiScheduleSchema>;
export type TimeRangeFormData = yup.InferType<typeof timeRangeSchema>;

export interface Schedule {
  id: number;
  dayOfWeek: number;
  timeStart: string;
  timeEnd: string;
  validFrom: string | null;
  validTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleStats {
  total: number;
  activePeriods: number;
  totalSlots: number;
  averageSlotsPerDay: number;
}

export interface ScheduleFilters {
  dayOfWeek?: number;
  validDate?: string;
}

// Days of week mapping
export const DAYS_OF_WEEK = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado'
} as const;

export const DAYS_OF_WEEK_SHORT = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb'
} as const;

export type DayOfWeek = keyof typeof DAYS_OF_WEEK;

// Helper functions
export const getDayLabel = (dayOfWeek: number): string => {
  return DAYS_OF_WEEK[dayOfWeek as DayOfWeek] || 'Dia inválido';
};

export const getDayShortLabel = (dayOfWeek: number): string => {
  return DAYS_OF_WEEK_SHORT[dayOfWeek as DayOfWeek] || 'Inv';
};

export const getDayOptions = () => {
  return Object.entries(DAYS_OF_WEEK).map(([value, label]) => ({
    value: parseInt(value),
    label,
  }));
};

// Time slot calculation (30-minute slots)
export const calculateTimeSlots = (timeStart: string, timeEnd: string): number => {
  const [startHour, startMinute] = timeStart.split(':').map(Number);
  const [endHour, endMinute] = timeEnd.split(':').map(Number);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  
  const totalMinutes = endTotalMinutes - startTotalMinutes;
  return Math.floor(totalMinutes / 30); // 30-minute slots
};

export const generateTimeSlots = (timeStart: string, timeEnd: string): string[] => {
  const slots: string[] = [];
  const [startHour, startMinute] = timeStart.split(':').map(Number);
  const [endHour, endMinute] = timeEnd.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  const endTotalMinutes = endHour * 60 + endMinute;
  
  while ((currentHour * 60 + currentMinute) < endTotalMinutes) {
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    slots.push(timeSlot);
    
    // Add 30 minutes
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }
  
  return slots;
};

// Format date for display
export const formatDateRange = (validFrom: string | null, validTo: string | null): string => {
  if (!validFrom && !validTo) return 'Sem período definido';
  if (!validFrom) return `Até ${new Date(validTo!).toLocaleDateString('pt-BR')}`;
  if (!validTo) return `A partir de ${new Date(validFrom).toLocaleDateString('pt-BR')}`;
  
  return `${new Date(validFrom).toLocaleDateString('pt-BR')} - ${new Date(validTo).toLocaleDateString('pt-BR')}`;
};

// Check if schedule is currently active
export const isScheduleActive = (schedule: Schedule): boolean => {
  const now = new Date();
  const validFrom = schedule.validFrom ? new Date(schedule.validFrom) : null;
  const validTo = schedule.validTo ? new Date(schedule.validTo) : null;
  
  if (validFrom && now < validFrom) return false;
  if (validTo && now > validTo) return false;
  
  return true;
}; 