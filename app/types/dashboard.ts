export interface DashboardOverview {
  totalUsers: number;
  totalChairs: number;
  totalAppointments: number;
  pendingApprovals: number;
}

export interface DashboardDay {
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

export interface DashboardUser {
  id: number;
  username: string;
}

export interface DashboardChair {
  id: number;
  name: string;
  location: string;
}

export interface DashboardRecentAppointment {
  id: number;
  userId: number;
  chairId: number;
  datetimeStart: string;
  datetimeEnd: string;
  status: string;
  presenceConfirmed: boolean;
  createdAt: string;
  user: DashboardUser;
  chair: DashboardChair;
}

export interface DashboardData {
  overview: DashboardOverview;
  today: DashboardDay;
  tomorrow: DashboardDay;
  chairs: DashboardChairs;
  appointments: DashboardAppointments;
  userAppointments: DashboardUserAppointments | null;
  recentAppointments: DashboardRecentAppointment[];
  lastUpdated: string;
} 