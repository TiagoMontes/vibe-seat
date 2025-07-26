"use client";

import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import Layout from "@/app/layout/index";

export default function ManagementPage() {
  return (
    <ProtectedRoute requiredRole="attendant">
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Painel de Gestão</h1>
          <p className="text-gray-600">
            Esta área é restrita a atendentes e administradores aprovados.
          </p>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}