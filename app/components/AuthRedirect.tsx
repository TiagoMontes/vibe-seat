"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePermissions } from "@/app/hooks/usePermissions";

export const AuthRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, getRedirectPath, isAuthenticated } = usePermissions();

  useEffect(() => {
    // Se não está autenticado, não faz nada (deixa o sistema de auth lidar)
    if (!isAuthenticated) return;

    // Se está autenticado mas não tem dados do usuário, aguarda
    if (!user) return;

    // Se está na página de login e está autenticado, redireciona
    if (pathname === "/" && isAuthenticated) {
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
      return;
    }

    // Se o usuário não está aprovado, redireciona para a página principal
    // EXCETO se estiver na página de perfil (/user) - permitir acesso
    if (
      user.status !== "approved" &&
      pathname !== "/" &&
      pathname !== "/user"
    ) {
      router.push("/");
      return;
    }
  }, [user, pathname, router, isAuthenticated, getRedirectPath]);

  return null;
};
