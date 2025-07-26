"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/app/hooks/usePermissions';
import { UserRole } from '@/app/atoms/userAtoms';
import { AlertCircleIcon, ShieldXIcon, ClockIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireApproval?: boolean;
  fallbackPath?: string;
  showErrorPage?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
  requireApproval = true,
  fallbackPath,
  showErrorPage = true
}) => {
  const router = useRouter();
  const { hasRoleAndApproved, user, isAuthenticated, getRedirectPath } = usePermissions();

  // Check if user is authenticated
  if (!isAuthenticated) {
    if (fallbackPath) {
      router.push(fallbackPath);
      return null;
    }
    router.push('/');
    return null;
  }

  // Check permissions
  const permissionCheck = hasRoleAndApproved(requiredRole);
  
  if (!permissionCheck.hasPermission) {
    if (fallbackPath) {
      router.push(fallbackPath);
      return null;
    }

    if (!showErrorPage) {
      router.push(getRedirectPath());
      return null;
    }

    // Show error page
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {user?.status !== 'approved' ? (
                <ClockIcon className="h-12 w-12 text-yellow-500" />
              ) : (
                <ShieldXIcon className="h-12 w-12 text-red-500" />
              )}
            </div>
            <CardTitle className="text-xl">
              {user?.status !== 'approved' ? 'Aguardando Aprovação' : 'Acesso Negado'}
            </CardTitle>
            <CardDescription>
              {permissionCheck.reason}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.status !== 'approved' ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Seu cadastro está sendo analisado. Você será notificado quando for aprovado.
                </p>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircleIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      Status: {user?.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Você não tem permissão para acessar esta área do sistema.
                </p>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircleIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      Seu nível: {user?.role} | Necessário: {requiredRole}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(getRedirectPath())}
              >
                Página Inicial
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook para usar em componentes específicos
export const useProtectedAction = () => {
  const { hasRoleAndApproved } = usePermissions();

  return {
    checkPermission: (requiredRole: UserRole) => hasRoleAndApproved(requiredRole),
    withPermission: (requiredRole: UserRole, action: () => void) => {
      const check = hasRoleAndApproved(requiredRole);
      if (check.hasPermission) {
        action();
      } else {
        console.warn('Ação bloqueada:', check.reason);
        // Aqui poderia mostrar um toast ou modal de erro
      }
    }
  };
};