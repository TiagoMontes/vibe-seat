import * as yup from "yup";

export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export const appointmentSchema = yup.object({
  chairId: yup
    .number()
    .required("Cadeira é obrigatória")
    .min(1, "ID da cadeira inválido"),
  datetimeStart: yup
    .string()
    .required("Data e hora são obrigatórias"),
});

export type AppointmentFormData = yup.InferType<typeof appointmentSchema>;

export interface Appointment {
  id: number;
  userId: number;
  chairId: number;
  datetimeStart: string;
  datetimeEnd: string;
  status: AppointmentStatus;
  presenceConfirmed: boolean;
  createdAt: string;
  user?: {
    id: number;
    username: string;
  };
  chair?: {
    id: number;
    name: string;
    location?: string;
  };
}

export interface AppointmentInput {
  chairId: number;
  datetimeStart: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  pagination: PaginationInfo;
}

export interface AppointmentFilters {
  page: number;
  limit: number;
  status: "all" | "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export interface AvailableTime {
  time: string; // "HH:MM" format
  available: boolean;
  reason?: string; // why it's not available
}

export interface AvailableTimesResponse {
  chairs: Array<{
    chairId: number;
    chairName: string;
    chairLocation?: string | null;
    available: string[];
    unavailable: string[];
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
}

// Status mapping system
export const AppointmentStatusMap = {
  SCHEDULED: {
    value: "SCHEDULED",
    label: "Agendado",
    color: "blue",
  },
  CONFIRMED: {
    value: "CONFIRMED", 
    label: "Confirmado",
    color: "green",
  },
  CANCELLED: {
    value: "CANCELLED",
    label: "Cancelado", 
    color: "red",
  },
  COMPLETED: {
    value: "COMPLETED",
    label: "Concluído", 
    color: "gray",
  },
} as const;

export type AppointmentStatusKey = AppointmentStatus;

// Helper functions
export const getStatusLabel = (status: AppointmentStatusKey): string => {
  return AppointmentStatusMap[status]?.label || status;
};

export const getStatusColor = (status: AppointmentStatusKey): string => {
  return AppointmentStatusMap[status]?.color || "gray";
};

export const getStatusOptions = () => {
  return Object.values(AppointmentStatusMap).map(status => ({
    value: status.value,
    label: status.label,
  }));
};

// Helper to check if appointment can be cancelled
export const canCancelAppointment = (appointment: Appointment, userRole: string = "user"): boolean => {
  // Admin can cancel any appointment
  if (userRole === "admin") {
    return appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED";
  }

  // User can only cancel SCHEDULED appointments
  if (appointment.status !== "SCHEDULED") {
    return false;
  }

  // Check if appointment is at least 3 hours in the future
  const now = new Date();
  const appointmentTime = new Date(appointment.datetimeStart);
  const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return diffHours >= 3;
};

// Helper to get cancellation message
export const getCancellationMessage = (appointment: Appointment, userRole: string = "user"): string => {
  if (userRole === "admin") {
    return "";
  }

  if (appointment.status !== "SCHEDULED") {
    return "Apenas agendamentos com status 'Agendado' podem ser cancelados.";
  }

  const now = new Date();
  const appointmentTime = new Date(appointment.datetimeStart);
  const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 3) {
    return "É necessário cancelar com pelo menos 3 horas de antecedência.";
  }

  return "";
}; 