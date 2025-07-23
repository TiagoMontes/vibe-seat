"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useUserData } from "@/app/hooks/useUserData";
import Layout from "../layout/index";
import { Dashboard } from "@/app/components/Dashboard";

export default function HomePage() {
  const { logout } = useAuth();
  const { userName, userRole } = useUserData();

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout userName={userName} userRole={userRole} onLogout={handleLogout}>
      <Dashboard />
    </Layout>
  );
}
