import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Constantes para os roles (para evitar magic numbers)
export const ROLES = {
  ADMIN: 1,
  ATTENDANT: 2,
  USER: 3,
} as const;

export type RoleId = typeof ROLES[keyof typeof ROLES];

/**
 * Mapper para converter roleIds em nomes amigáveis
 * 
 * @param roleId - ID do role (1, 2, 3)
 * @returns Nome amigável do role
 * 
 * @example
 * ```typescript
 * getRoleName(1) // "Administrador"
 * getRoleName(2) // "Attendant - Operacional"
 * getRoleName(3) // "User - Usuário"
 * getRoleName(null) // "Não definida"
 * ```
 */
export const getRoleName = (roleId: number | null | undefined): string => {
  switch (roleId) {
    case ROLES.ADMIN:
      return "Administrador";
    case ROLES.ATTENDANT:
      return "Attendant - Operacional";
    case ROLES.USER:
      return "User - Usuário";
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
export const hasRole = (userRoleId: number | null | undefined, requiredRole: RoleId): boolean => {
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
