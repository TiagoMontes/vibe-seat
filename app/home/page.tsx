"use client";

import { useRouter } from "next/navigation";
import Layout from "../layout/index";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <Layout
      userName="João Silva"
      userRole="Administrador"
      onLogout={handleLogout}
    >
      <div>
        <h1>Gato</h1>
      </div>
    </Layout>
  );
}
