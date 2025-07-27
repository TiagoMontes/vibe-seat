"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Layout from "../layout/index";
import { Dashboard } from "@/app/components/modal/Dashboard";
import { userAtom } from "../atoms/userAtoms";
import { useAtom } from "jotai";

export default function HomePage() {
  const { logout } = useAuth();
  const [user] = useAtom(userAtom);

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
