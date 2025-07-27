"use client";

import Login from "./components/Login";
import Register from "./components/Register";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [showRegister, setShowRegister] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Só redireciona se estiver autenticado e não estiver carregando
    if (status === "authenticated" && session?.user) {
      router.push("/home");
    }
  }, [status, session, router]);

  // Mostrar loading enquanto verifica a autenticação
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center text-black items-center h-screen w-full bg-gray-50">
      {showRegister ? (
        <Register onBackToLogin={() => setShowRegister(false)} />
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          <Login />
          <p className="text-sm text-gray-600">
            Não tem uma conta?{" "}
            <button
              onClick={() => setShowRegister(true)}
              className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium underline"
            >
              Criar conta
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
