"use client";

import { SessionProvider } from "next-auth/react";
import { Provider as JotaiProvider } from "jotai";
import { ToastContainer } from "react-toastify";
import { UserDataSync } from "@/app/components/UserDataSync";
import { AuthRedirect } from "@/app/components/AuthRedirect";
import { DebugInfo } from "@/app/components/DebugInfo";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <SessionProvider>
        <UserDataSync />
        <AuthRedirect />
        {children}
        <DebugInfo />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </SessionProvider>
    </JotaiProvider>
  );
}
