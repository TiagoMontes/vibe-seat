// Tipos baseados na API SEJUSP

// ===== PAGINAÇÃO =====
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}

// ===== AUTENTICAÇÃO =====
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

// ===== USUÁRIOS =====
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  username: string;
  status: UserStatus;
  roleId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role?: {
    id: number;
    name: string;
  };
}

export interface CreateUserRequest {
  username: string;
  password: string;
  roleId: number;
}

export interface UserStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface UserListResponse {
  users: User[];
  pagination: Pagination;
  stats: UserStats;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  roleId?: number;
  sortBy?: 'newest' | 'oldest' | 'username-asc' | 'username-desc';
}

// ===== CADEIRAS =====
export type ChairStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export interface Chair {
  id: number;
  name: string;
  description?: string;
  location?: string;
  status: ChairStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateChairRequest {
  name: string;
  description?: string;
  location?: string;
}

export interface UpdateChairRequest {
  name?: string;
  description?: string;
  location?: string;
  status?: ChairStatus;
}

export interface ChairListResponse {
  chairs: Chair[];
  pagination: Pagination;
}

export interface ChairFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ChairStatus;
  sortBy?: 'newest' | 'oldest' | 'name-asc' | 'name-desc';
}

// ===== AGENDAMENTOS =====
export type AppointmentStatus = 'SCHEDULED' | 'CANCELLED' | 'CONFIRMED';

export interface Appointment {
  id: number;
  userId: number;
  chairId: number;
  datetimeStart: string;
  datetimeEnd: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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

export interface CreateAppointmentRequest {
  chairId: number;
  datetimeStart: string;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  pagination: Pagination;
}

export interface MyAppointmentsResponse {
  appointments: Appointment[];
  total: number;
  scheduled: number;
  confirmed: number;
  confirmedUpcoming: number;
  confirmedDone: number;
  cancelled: number;
  message: string;
}

export interface AvailableTimeSlot {
  chairId: number;
  chairName: string;
  chairLocation?: string;
  available: string[];
  unavailable: string[];
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
}

export interface AvailableTimesResponse {
  chairs: AvailableTimeSlot[];
  pagination: Pagination;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: AppointmentStatus;
  sortBy?: 'newest' | 'oldest' | 'datetime-asc' | 'datetime-desc';
}

// ===== APROVAÇÕES =====
export interface Approval {
  id: number;
  userId: number;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    id: number;
    username: string;
  };
  role?: {
    id: number;
    name: string;
  };
}

export interface UpdateApprovalRequest {
  status: UserStatus;
}

export interface ApprovalListResponse {
  approvals: Approval[];
  pagination: Pagination;
  stats: UserStats;
}

export interface ApprovalFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  sortBy?: 'newest' | 'oldest' | 'user-asc' | 'user-desc';
}

// ===== DIAS DA SEMANA =====
export interface DayOfWeek {
  id: number;
  name: string;
  scheduleConfigId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateDayRequest {
  name: string;
}

export interface UpdateDayRequest {
  name: string;
}

export interface DayListResponse {
  days: DayOfWeek[];
  pagination: Pagination;
}

export interface DeleteDaysRequest {
  ids: number[];
}

export interface DayFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'name-asc' | 'name-desc';
}

// ===== CONFIGURAÇÕES DE HORÁRIO =====
export interface TimeRange {
  start: string; // "HH:MM" format
  end: string; // "HH:MM" format
}

export interface Schedule {
  id: number;
  timeRanges: TimeRange[];
  validFrom: string;
  validTo: string;
  days: DayOfWeek[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateScheduleRequest {
  timeRanges: TimeRange[];
  validFrom: string;
  validTo: string;
  dayIds: number[];
}

export interface UpdateScheduleRequest {
  timeRanges?: TimeRange[];
  validFrom?: string;
  validTo?: string;
  dayIds?: number[];
}

// ===== DASHBOARD =====
export interface DashboardOverview {
  totalUsers: number;
  totalChairs: number;
  totalAppointments: number;
  pendingApprovals: number;
}

export interface DashboardToday {
  appointments: number;
}

export interface DashboardTomorrow {
  appointments: number;
}

export interface DashboardChairs {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
}

export interface DashboardAppointments {
  total: number;
  scheduled: number;
  confirmed: number;
  cancelled: number;
  confirmedUpcoming: number;
  confirmedDone: number;
}

export interface DashboardUserAppointments {
  total: number;
  scheduled: number;
  confirmed: number;
  cancelled: number;
  confirmedUpcoming: number;
  confirmedDone: number;
}

export interface DashboardResponse {
  overview: DashboardOverview;
  today: DashboardToday;
  tomorrow: DashboardTomorrow;
  chairs: DashboardChairs;
  appointments: DashboardAppointments;
  userAppointments: DashboardUserAppointments;
  recentAppointments: Appointment[];
  lastUpdated: string;
}

// ===== ROLES =====
export interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RoleListResponse {
  roles: Role[];
}

// ===== ERROS =====
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
} 