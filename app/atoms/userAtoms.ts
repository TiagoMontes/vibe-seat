import { atom } from 'jotai';

export type UserRole = 'user' | 'attendant' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserData {
  id: number;
  username: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  cpf: string;
  jobFunction: string;
  position: string;
  registration: string;
  sector: string;
  email: string;
  phone: string;
  gender: 'M' | 'F' | 'Outro';
  birthDate: string;
}

// Atom principal do usuário
export const userAtom = atom<UserData | null>(null);

// Atom derivado para verificar se está autenticado
export const isAuthenticatedAtom = atom(
  (get) => get(userAtom) !== null
);

// Atoms derivados para propriedades específicas
export const userNameAtom = atom(
  (get) => get(userAtom)?.username || "Usuário"
);

export const userRoleAtom = atom(
  (get) => get(userAtom)?.role || "User"
);

export const userIdAtom = atom(
  (get) => get(userAtom)?.id || ""
);

export const userStatusAtom = atom(
  (get) => get(userAtom)?.status || "pending"
);

// Atom derivado para verificar se o usuário foi aprovado
export const isApprovedAtom = atom(
  (get) => get(userAtom)?.status === "approved"
);

// Atoms derivados para verificações de permissões (usando as permissões computadas)
export const canManageChairsAtom = atom(
  (get) => {
    const user = get(userAtom);
    if (!user) return false;
    return computePermissions(user.role, user.status).canManageChairs;
  }
);

export const canApproveUsersAtom = atom(
  (get) => {
    const user = get(userAtom);
    if (!user) return false;
    return computePermissions(user.role, user.status).canApproveUsers;
  }
);

export const canViewDashboardAtom = atom(
  (get) => {
    const user = get(userAtom);
    if (!user) return false;
    return computePermissions(user.role, user.status).canViewDashboard;
  }
);

export const canCreateAppointmentsAtom = atom(
  (get) => {
    const user = get(userAtom);
    if (!user) return false;
    return computePermissions(user.role, user.status).canCreateAppointments;
  }
);

// Função utilitária para computar permissões
export const computePermissions = (role: UserRole, status: UserStatus) => ({
  canManageChairs: role === 'admin' && status === 'approved',
  canApproveUsers: ['attendant', 'admin'].includes(role) && status === 'approved',
  canViewDashboard: ['attendant', 'admin'].includes(role) && status === 'approved',
  canCreateAppointments: ['user', 'attendant', 'admin'].includes(role) && status === 'approved',
}); 