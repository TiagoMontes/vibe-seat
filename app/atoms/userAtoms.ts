import { atom } from 'jotai';

export type UserRole = 'user' | 'attendant' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserData {
  id: string;
  username: string;
  role: UserRole;
  status: UserStatus;
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

// Atoms derivados para verificações de permissões
export const canManageChairsAtom = atom(
  (get) => {
    const user = get(userAtom);
    return user?.role === "admin" && user?.status === "approved";
  }
);

export const canApproveUsersAtom = atom(
  (get) => {
    const user = get(userAtom);
    return (user?.role === "attendant" || user?.role === "admin") && user?.status === "approved";
  }
);

export const canViewDashboardAtom = atom(
  (get) => {
    const user = get(userAtom);
    return (user?.role === "attendant" || user?.role === "admin") && user?.status === "approved";
  }
);

export const canManageAppointmentsAtom = atom(
  (get) => {
    const user = get(userAtom);
    return (user?.role === "attendant" || user?.role === "admin") && user?.status === "approved";
  }
); 