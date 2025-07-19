"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Layout from "../layout/index";

export default function HomePage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout
      userName={user?.name || "Usuário"}
      userRole={user?.role || "User"}
      onLogout={handleLogout}
    >
      <div>
        <h1 className="text-3xl font-bold mb-6">Bem-vindo, {user?.name}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">
              Informações do Usuário
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Nome:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Role:</strong> {user?.role}
              </p>
              <p>
                <strong>ID:</strong> {user?.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
