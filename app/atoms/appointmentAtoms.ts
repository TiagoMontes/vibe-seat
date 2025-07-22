import { atom } from "jotai";
import { Appointment, PaginationInfo, AppointmentFilters, AvailableTimesResponse } from "@/app/schemas/appointmentSchema";

// Lista de appointments do usuário
export const appointmentsAtom = atom<Appointment[]>([]);

// Informações de paginação
export const appointmentPaginationAtom = atom<PaginationInfo>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPrevPage: false,
});

// Filtros ativos
export const appointmentFiltersAtom = atom<AppointmentFilters>({
  page: 1,
  limit: 10,
  status: "all",
});

// Estados de loading
export const appointmentsLoadingAtom = atom<boolean>(false);
export const appointmentCreateLoadingAtom = atom<boolean>(false);
export const appointmentCancelLoadingAtom = atom<boolean>(false);
export const appointmentConfirmLoadingAtom = atom<boolean>(false);
export const availableTimesLoadingAtom = atom<boolean>(false);

// Modal states
export const appointmentModalOpenAtom = atom<boolean>(false);
export const selectedAppointmentAtom = atom<Appointment | null>(null);

// Available times data
export const availableTimesAtom = atom<AvailableTimesResponse | null>(null);

// Selected chair and date for booking
export const selectedChairIdAtom = atom<number | null>(null);
export const selectedDateAtom = atom<string>("");
export const selectedTimeAtom = atom<string>("");

// Error handling
export const appointmentErrorAtom = atom<string>("");
export const appointmentSuccessMessageAtom = atom<string>("");

// Derived atom to check if user has any active appointments
export const hasActiveAppointmentsAtom = atom((get) => {
  const appointments = get(appointmentsAtom);
  return appointments.some(apt => apt.status === "SCHEDULED" || apt.status === "CONFIRMED");
});

// Derived atom to get upcoming appointments (next 24 hours)
export const upcomingAppointmentsAtom = atom((get) => {
  const appointments = get(appointmentsAtom);
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return appointments.filter(apt => {
    const aptDate = new Date(apt.datetimeStart);
    return aptDate >= now && aptDate <= tomorrow && 
           (apt.status === "SCHEDULED" || apt.status === "CONFIRMED");
  });
}); 