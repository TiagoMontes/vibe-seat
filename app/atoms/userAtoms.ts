import { atom } from 'jotai';

export interface UserData {
  id: string;
  username: string;
  role: string;
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