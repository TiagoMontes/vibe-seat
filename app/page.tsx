"use client";

import { useRouter } from "next/navigation";
import Login from "./components/Login";

export default function LoginPage() {
  const router = useRouter();

  function handleLogin() {
    router.push("/home");
  }

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <Login
        onLogin={() => handleLogin()}
        onRegister={() => {
          console.log("Register");
        }}
      />
    </div>
  );
}
