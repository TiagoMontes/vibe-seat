"use client";

import React, { useState } from "react";
import { cn } from "@/app/lib/utils";
import UserManagement from "@/app/components/UserManagement";
import { Button } from "../components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

type TabKey = "dashboard" | "users";

interface Tab {
  key: TabKey;
  label: string;
  component: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  userName = "Usuário",
  userRole = "Admin",
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  // Verificar se o usuário tem permissão para ver a aba de usuários
  const canManageUsers =
    userRole === "Admin" || userRole === "admin" || userRole === "attendant";

  const tabs: Tab[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      component: children,
    },
    ...(canManageUsers
      ? [
          {
            key: "users" as TabKey,
            label: "Usuários",
            component: <UserManagement />,
          },
        ]
      : []),
  ];

  // Se o usuário não tem permissão para a aba ativa, voltar para dashboard
  React.useEffect(() => {
    if (activeTab === "users" && !canManageUsers) {
      setActiveTab("dashboard");
    }
  }, [activeTab, canManageUsers]);

  const activeTabComponent =
    tabs.find((tab) => tab.key === activeTab)?.component || children;

  return (
    <div className={cn("h-screen bg-background flex", className)}>
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-gray-300 flex flex-col bg-white text-black h-screen">
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-gray-300">
          <h1 className="text-xl font-bold">Vibe Seat</h1>
        </div>

        {/* Menu de Opções */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Área do Usuário */}
        <div className="p-4 border-t border-gray-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs truncate">{userRole}</p>
            </div>
          </div>

          <Button
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto text-black h-screen">
        <div className="p-6">{activeTabComponent}</div>
      </main>
    </div>
  );
};

export default Layout;
