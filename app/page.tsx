"use client";

import { useAuth } from "./hooks/useAuth";
import Login from "./components/Login";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isAuthenticated, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="text-center flex flex-col gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <Login />
    </div>
  );
}
