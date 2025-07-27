"use client";

import { useAtom } from 'jotai';
import {
  userAtom,
  isApprovedAtom,
  canManageChairsAtom,
  canApproveUsersAtom,
  canViewDashboardAtom,
  UserRole
} from '@/app/atoms/userAtoms';

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
}

export const usePermissions = () => {
  const [user] = useAtom(userAtom);
  const [isApproved] = useAtom(isApprovedAtom);
  const [canManageChairs] = useAtom(canManageChairsAtom);
  const [canApproveUsers] = useAtom(canApproveUsersAtom);
  const [canViewDashboard] = useAtom(canViewDashboardAtom);

  // Hierarquia de roles: user < attendant < admin
  const roleHierarchy: Record<UserRole, number> = {
    'user': 1,
    'attendant': 2,
    'admin': 3
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!user) return false;

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  const hasRoleAndApproved = (requiredRole: UserRole): PermissionCheck => {
    if (!user) {
      return { hasPermission: false, reason: 'Usuário não autenticado' };
    }

    if (user.status !== 'approved') {
      return { 
        hasPermission: false, 
        reason: 'Usuário não aprovado. Aguarde a aprovação do administrador.' 
      };
    }

    if (!hasRole(requiredRole)) {
      return { 
        hasPermission: false, 
        reason: `Acesso negado. Permissão mínima requerida: ${requiredRole}` 
      };
    }

    return { hasPermission: true };
  };

  const canAccessRoute = (route: string): PermissionCheck => {
    // Only check for actual routes that exist in the app
    const routePermissions: Record<string, UserRole> = {
      '/user': 'user', // Profile page - any approved user can access
      '/home': 'user'  // Main app with tabs - any approved user can access
    };

    const requiredRole = routePermissions[route];
    if (!requiredRole) {
      return { hasPermission: true }; // Public routes like login
    }

    return hasRoleAndApproved(requiredRole);
  };

  const getRedirectPath = (): string => {
    if (!user) return '/';
    
    if (user.status !== 'approved') {
      return '/';
    }

    // Se o usuário está aprovado e está tentando acessar /user, permitir
    // Caso contrário, redirecionar para /home
    return '/home';
  };

  return {
    // User data
    user,
    isAuthenticated: !!user,
    isApproved,

    // Role checks
    hasRole,
    hasRoleAndApproved,
    canAccessRoute,

    // Specific permissions
    canManageChairs,
    canApproveUsers,
    canViewDashboard,

    // Derived permissions
    canCreateAppointments: user?.status === 'approved',
    canViewMyAppointments: user?.status === 'approved',
    canCancelAppointments: user?.status === 'approved',
    canViewChairs: user?.status === 'approved',
    canViewSchedules: user?.status === 'approved',
    canManageSchedules: canManageChairs, // Admin only
    canDeleteUsers: canManageChairs, // Admin only

    // Utility
    getRedirectPath,
    getRoleLabel: () => {
      switch (user?.role) {
        case 'admin': return 'Administrador';
        case 'attendant': return 'Atendente';
        case 'user': return 'Usuário';
        default: return 'Usuário';
      }
    },
    getStatusLabel: () => {
      switch (user?.status) {
        case 'approved': return 'Aprovado';
        case 'pending': return 'Pendente';
        case 'rejected': return 'Rejeitado';
        default: return 'Pendente';
      }
    }
  };
};