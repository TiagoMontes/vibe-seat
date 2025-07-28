import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Constantes para os roles (para evitar magic numbers)
export const ROLES = {
  ADMIN: 1,
  ATTENDANT: 2,
  USER: 3,
} as const;

export const ROLE_NAMES = {
  ADMIN: "admin",
  ATTENDANT: "attendant",
  USER: "user",
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

/**
 * Mapper para converter roleIds em nomes amigáveis
 *
 * @param roleId - ID do role (1, 2, 3)
 * @returns Nome amigável do role
 *
 * @example
 * ```typescript
 * getRoleNameById(1) // "Administrador"
 * getRoleNameById(2) // "Attendant - Operacional"
 * getRoleNameById(3) // "User - Usuário"
 * getRoleNameById(null) // "Não definida"
 * ```
 */
export const getRoleNameById = (roleId: number): string => {
  switch (roleId) {
    case ROLES.ADMIN:
      return "Administrador";
    case ROLES.ATTENDANT:
      return "Atendente";
    case ROLES.USER:
      return "Usuário";
    default:
      return "Não definida";
  }
};

export const getRoleByName = (roleName: string): string => {
  switch (roleName) {
    case ROLE_NAMES.ADMIN:
      return "Administrador";
    case ROLE_NAMES.ATTENDANT:
      return "Atendente";
    case ROLE_NAMES.USER:
      return "Usuário";
    default:
      return "Não definida";
  }
};

/**
 * Verifica se um usuário tem um role específico
 *
 * @param userRoleId - ID do role do usuário
 * @param requiredRole - ID do role requerido
 * @returns true se o usuário tem o role requerido
 *
 * @example
 * ```typescript
 * hasRole(1, ROLES.ADMIN) // true
 * hasRole(2, ROLES.ADMIN) // false
 * ```
 */
export const hasRole = (
  userRoleId: number | null | undefined,
  requiredRole: RoleId
): boolean => {
  return userRoleId === requiredRole;
};

/**
 * Verifica se um usuário é administrador
 *
 * @param userRoleId - ID do role do usuário
 * @returns true se o usuário é admin
 *
 * @example
 * ```typescript
 * isAdmin(1) // true
 * isAdmin(2) // false
 * isAdmin(null) // false
 * ```
 */
export const isAdmin = (userRoleId: number | null | undefined): boolean => {
  return hasRole(userRoleId, ROLES.ADMIN);
};

/**
 * Verifica se um usuário é attendant/operacional
 *
 * @param userRoleId - ID do role do usuário
 * @returns true se o usuário é attendant
 *
 * @example
 * ```typescript
 * isAttendant(2) // true
 * isAttendant(1) // false
 * ```
 */
export const isAttendant = (userRoleId: number | null | undefined): boolean => {
  return hasRole(userRoleId, ROLES.ATTENDANT);
};

/**
 * Verifica se um usuário é user comum
 *
 * @param userRoleId - ID do role do usuário
 * @returns true se o usuário é user comum
 *
 * @example
 * ```typescript
 * isUser(3) // true
 * isUser(1) // false
 * ```
 */
export const isUser = (userRoleId: number | null | undefined): boolean => {
  return hasRole(userRoleId, ROLES.USER);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-100 text-blue-800";
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getChairStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "MAINTENANCE":
      return "bg-yellow-100 text-yellow-800";
    case "INACTIVE":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusVariant = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "secondary";
    case "CONFIRMED":
      return "default";
    case "COMPLETED":
      return "default";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "Agendado";
    case "CONFIRMED":
      return "Confirmado";
    case "COMPLETED":
      return "Concluído";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status;
  }
};

// Utility to remove UTC timezone and treat as local time
export const parseAsLocalTime = (dateTimeString: string): Date => {
  // Se a string tem Z, é UTC, então criamos a data e convertemos para local
  if (dateTimeString.includes("Z")) {
    return new Date(dateTimeString);
  }
  // Se não tem Z, já é local
  const dateStr = dateTimeString.replace("T", " ");
  return new Date(dateStr);
};

// Enhanced formatDateTime that handles UTC properly and supports time ranges
export const formatDateTime = (dateTimeString: string) => {
  const date = parseAsLocalTime(dateTimeString);
  return {
    date: date.toLocaleDateString("pt-BR"),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

// Format date range with start and end times
export const formatDateTimeRange = (
  datetimeStart: string,
  datetimeEnd: string
) => {
  const startDate = parseAsLocalTime(datetimeStart);
  const endDate = parseAsLocalTime(datetimeEnd);

  return {
    date: startDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    timeRange: `${startDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    startTime: startDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    endTime: endDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

// Format creation timestamp
export const formatCreatedAt = (createdAt: string) => {
  const date = parseAsLocalTime(createdAt);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Check if appointment date is in the past
export const isAppointmentPast = (datetime: string): boolean => {
  const appointmentDate = parseAsLocalTime(datetime);
  const now = new Date();
  return appointmentDate < now;
};

// Check if appointment can be cancelled (3+ hours before)
export const canCancelAppointment = (appointment: {
  datetimeStart: string;
  status: string;
}): boolean => {
  const appointmentDate = parseAsLocalTime(appointment.datetimeStart);
  const now = new Date();
  const hoursDiff =
    (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return appointment.status === "SCHEDULED" && hoursDiff >= 3;
};

// Appointment status and filter constants
export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "SCHEDULED", label: "Agendado" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELLED", label: "Cancelado" },
];

export const APPOINTMENT_SORT_OPTIONS = [
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
];

// Default appointment filter values
export const DEFAULT_APPOINTMENT_FILTERS = {
  page: 1,
  limit: 6,
  status: "all" as const,
  search: "",
  sortBy: "newest" as const,
};

// Hook personalizado para debounce
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
