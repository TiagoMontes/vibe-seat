"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Layout from "../layout/index";
import { Dashboard } from "@/app/components/modal/Dashboard";
import { userAtom } from "../atoms/userAtoms";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { logout } = useAuth();
  const [user] = useAtom(userAtom);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Verificar autenticação
  useEffect(() => {
    // Se não está carregando e não há sessão, redirecionar para login
    if (status === "unauthenticated" || (!session && status !== "loading")) {
      console.log(
        "HomePage - Usuário não autenticado, redirecionando para login"
      );
      router.push("/");
      return;
    }

    // Se não há dados do usuário mas há sessão, aguardar carregamento
    if (status === "authenticated" && session?.user && !user) {
      console.log(
        "HomePage - Sessão existe mas dados do usuário ainda não carregaram"
      );
      return;
    }

    // Se há sessão mas não há dados do usuário após um tempo, pode ser um problema
    if (status === "authenticated" && session?.user && !user) {
      console.log(
        "HomePage - Problema: sessão existe mas sem dados do usuário"
      );
    }
  }, [session, status, user, router]);

  // Mostrar loading enquanto verifica autenticação
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderizar nada (será redirecionado)
  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  console.log("HomePage - user:", user);

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout
      userName={user?.username}
      userRole={user?.role}
      userData={user}
      onLogout={handleLogout}
    >
      <Dashboard />
    </Layout>
  );
}
