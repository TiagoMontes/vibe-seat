import { atom } from 'jotai';

// Tipos
export interface User {
  id: number;
  username: string;
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  roleId: number;
}

export interface Role {
  id: number;
  name: string;
}

export interface Approval {
  id: number;
  userId: number;
  requestedRoleId: number;
  approvedById: number | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: User;
  requestedRole: Role;
}

export interface RegisteredUser {
  id: number;
  username: string;
  status: 'pending' | 'approved' | 'rejected';
  roleId: number;
  role?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Atoms para aprovações
export const approvalsAtom = atom<Approval[]>([]);
export const approvalsLoadingAtom = atom<boolean>(false);
export const approvalsErrorAtom = atom<string | null>(null);

// Atoms para usuários
export const registeredUsersAtom = atom<RegisteredUser[]>([]);
export const usersLoadingAtom = atom<boolean>(false);
export const usersErrorAtom = atom<string | null>(null);

// Atom derivado para contagem de aprovações pendentes
export const pendingCountAtom = atom((get) => {
  const approvals = get(approvalsAtom);
  return approvals.filter(approval => approval.status === 'pending').length;
});

// Atom derivado para contagem total de usuários
export const totalUsersCountAtom = atom((get) => {
  const users = get(registeredUsersAtom);
  return users.length;
});

// Atom para sincronizar mudanças de aprovação com usuários
export const syncUsersWithApprovalsAtom = atom(
  null,
  (get, set, _update) => {
    const approvals = get(approvalsAtom);
    const users = get(registeredUsersAtom);
    
    // Atualizar status dos usuários baseado nas aprovações
    const updatedUsers = users.map(user => {
      const approval = approvals.find(app => app.userId === user.id);
      if (approval && approval.status !== user.status) {
        return { ...user, status: approval.status };
      }
      return user;
    });
    
    // Só atualizar se houve mudanças
    const hasChanges = updatedUsers.some((user, index) => 
      user.status !== users[index].status
    );
    
    if (hasChanges) {
      set(registeredUsersAtom, updatedUsers);
    }
  }
); 