"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/app/lib/utils";
import UserManagement from "@/app/components/UserManagement";
import MobileMenu from "@/app/components/MobileMenu";
import SidebarAccordion from "@/app/components/SidebarAccordion";
import { Home, Users } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

type TabKey = "dashboard" | "users" | "chairs" | "schedules";

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
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
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Verificar se o usuário tem permissão para ver a aba de usuários
  const canManageUsers =
    userRole === "Admin" || userRole === "admin" || userRole === "attendant";

  const tabs: Tab[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      component: children,
    },
    ...(canManageUsers
      ? [
          {
            key: "users" as TabKey,
            label: "Usuários",
            icon: <Users className="h-4 w-4" />,
            component: <UserManagement />,
          },
          //       {
          //         key: "chairs" as TabKey,
          //         label: "Cadeiras",
          //         icon: <Chair className="h-4 w-4" />,
          //         component: <ChairManagement />,
          //       },
          //       {
          //         key: "schedules" as TabKey,
          //         label: "Gestão de disponibilidade",
          //         icon: <Calendar className="h-4 w-4" />,
          //         component: <ScheduleManagement />,
          //       },
          //       {
          //         key: "appointments" as TabKey,
          //         label: "Agendamentos",
          //         icon: <Clock className="h-4 w-4" />,
          //         component: <AppointmentManagement />,
          //       },
        ]
      : []),
  ];

  // Se o usuário não tem permissão para a aba ativa, voltar para dashboard
  React.useEffect(() => {
    if (
      (activeTab === "users" ||
        activeTab === "chairs" ||
        activeTab === "schedules") &&
      !canManageUsers
    ) {
      setActiveTab("dashboard");
    }
  }, [activeTab, canManageUsers]);

  const activeTabComponent =
    tabs.find((tab) => tab.key === activeTab)?.component || children;

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey as TabKey);
  };

  return (
    <div className={cn("h-screen bg-background flex", className)}>
      {/* Sidebar com Accordion - Apenas no Desktop */}
      {!isMobile && (
        <SidebarAccordion
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto text-black h-screen">
        {/* Header mobile com menu dropdown */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h1 className="text-lg font-bold">{userName}</h1>

            <MobileMenu
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onLogout={onLogout}
            />
          </div>
        )}

        <div className={cn("p-4 sm:p-6", isMobile && "pt-0")}>
          {activeTabComponent}
        </div>
      </main>
    </div>
  );
};

export default Layout;
