import { atom } from "jotai";
import { Appointment, Pagination, AppointmentFilters, AvailableTimesResponse } from "@/app/types/api";

// ===== ESTADOS PRINCIPAIS =====

// Lista de appointments do usuário (para ScheduledAppointmentsList - admin)
export const appointmentsAtom = atom<Appointment[]>([]);

// Lista de appointments do usuário logado (Meus Agendamentos)
export const myAppointmentsAtom = atom<Appointment[]>([]);

// ===== PAGINAÇÃO SEPARADA =====

// Paginação para ScheduledAppointmentsList (admin)
export const appointmentPaginationAtom = atom<Pagination>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPrevPage: false,
  nextPage: null,
  prevPage: null,
  lastPage: 1,
});

// Paginação para MyAppointmentsList (usuário logado)
export const myAppointmentPaginationAtom = atom<Pagination>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPrevPage: false,
  nextPage: null,
  prevPage: null,
  lastPage: 1,
});

// ===== FILTROS SEPARADOS =====

// Filtros para ScheduledAppointmentsList (admin)
export const appointmentFiltersAtom = atom<AppointmentFilters>({
  page: 1,
  limit: 10,
  status: "SCHEDULED",
});

// Filtros para MyAppointmentsList (usuário logado)
export const myAppointmentFiltersAtom = atom<AppointmentFilters>({
  page: 1,
  limit: 10,
  status: "all",
});

// ===== ESTADOS DE LOADING =====
export const appointmentsLoadingAtom = atom<boolean>(false);
export const myAppointmentsLoadingAtom = atom<boolean>(false);
export const appointmentCreateLoadingAtom = atom<boolean>(false);
export const appointmentCancelLoadingAtom = atom<boolean>(false);
export const appointmentConfirmLoadingAtom = atom<boolean>(false);
export const availableTimesLoadingAtom = atom<boolean>(false);

// ===== ESTADOS DE MODAL =====
export const appointmentModalOpenAtom = atom<boolean>(false);
export const selectedAppointmentAtom = atom<Appointment | null>(null);

// ===== DADOS DE HORÁRIOS DISPONÍVEIS =====
export const availableTimesAtom = atom<AvailableTimesResponse | null>(null);

// ===== SELEÇÃO PARA AGENDAMENTO =====
export const selectedChairIdAtom = atom<number | null>(null);
export const selectedDateAtom = atom<string>("");
export const selectedTimeAtom = atom<string>("");

// ===== TRATAMENTO DE ERROS =====
export const appointmentErrorAtom = atom<string>("");
export const appointmentSuccessMessageAtom = atom<string>("");

// ===== ATOMS DERIVADOS =====

// Verifica se o usuário tem agendamentos ativos (para MyAppointmentsList)
export const hasActiveAppointmentsAtom = atom((get) => {
  const appointments = get(myAppointmentsAtom);
  return appointments.some(apt => apt.status === "SCHEDULED" || apt.status === "CONFIRMED");
});

// Agendamentos próximos (próximas 24 horas) para MyAppointmentsList
export const upcomingAppointmentsAtom = atom((get) => {
  const appointments = get(myAppointmentsAtom);
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return appointments.filter(apt => {
    const aptDate = new Date(apt.datetimeStart);
    return aptDate >= now && aptDate <= tomorrow && 
           (apt.status === "SCHEDULED" || apt.status === "CONFIRMED");
  });
}); 