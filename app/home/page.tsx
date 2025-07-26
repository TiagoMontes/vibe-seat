"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useUserData } from "@/app/hooks/useUserData";
import Layout from "../layout/index";
import { Dashboard } from "@/app/components/modal/Dashboard";

export default function HomePage() {
  const { logout } = useAuth();
  const { session } = useUserData();

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout userName={session?.user.username} userRole={session?.user.role} onLogout={handleLogout}>
      <Dashboard />
    </Layout>
  );
}
