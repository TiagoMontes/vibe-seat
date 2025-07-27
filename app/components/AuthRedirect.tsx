"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions } from '@/app/hooks/usePermissions';

export const AuthRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, getRedirectPath, isAuthenticated } = usePermissions();

  useEffect(() => {
    // Não redireciona durante o carregamento ou se não há mudança de autenticação
    if (!isAuthenticated || !user) return;

    // Se está na página de login e está autenticado, redireciona
    if (pathname === '/' && isAuthenticated) {
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
      return;
    }

    // Se o usuário não está aprovado e não está na página de pending
    if (user.status !== 'approved' && pathname !== '/pending-approval') {
      router.push('/');
      return;
    }

    // Se o usuário está aprovado mas está na página de pending
    if (user.status === 'approved' && pathname === '/pending-approval') {
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
      return;
    }
  }, [user, pathname, router, isAuthenticated, getRedirectPath]);

  return null;
};