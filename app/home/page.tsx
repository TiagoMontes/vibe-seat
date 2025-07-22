"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useUserData } from "@/app/hooks/useUserData";
import Layout from "../layout/index";

export default function HomePage() {
  const { logout } = useAuth();
  const { userName, userRole, userId } = useUserData();

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout userName={userName} userRole={userRole} onLogout={handleLogout}>
      <div>
        <h1 className="text-3xl font-bold mb-6">Bem-vindo, {userName}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">
              Informações do Usuário
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Username:</strong> {userName}
              </p>
              <p>
                <strong>Role:</strong> {userRole}
              </p>
              <p>
                <strong>ID:</strong> {userId}
              </p>
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">Reservas Rápidas</h3>
            <p className="text-muted-foreground">
              Faça reservas de assentos de forma simples e rápida.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">Gestão Inteligente</h3>
            <p className="text-muted-foreground">
              Sistema inteligente para otimizar o uso dos espaços.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
