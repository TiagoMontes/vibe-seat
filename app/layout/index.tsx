"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/app/lib/utils";
import UserManagement from "@/app/components/management/UserManagement";
import MobileMenu from "@/app/components/MobileMenu";
import SidebarAccordion from "@/app/components/SidebarAccordion";
import { Calendar, Clock, Home, Users } from "lucide-react";
import ChairManagement from "../components/management/ChairManagement";
import ScheduleManagement from "../components/management/ScheduleManagement";
import { AppointmentManagement } from "../components/management/AppointmentManagement";
import { useRouter } from "next/navigation";
import { Dashboard } from "../components/modal/Dashboard";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

type TabKey = "dashboard" | "users" | "chairs" | "schedules" | "appointments";

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
  const [activeTab, setActiveTab] = useState<TabKey>("appointments");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Role-based tab access control
  const getTabsForRole = (): Tab[] => {
    if (userRole === "admin") {
      return [
        {
          key: "appointments" as TabKey,
          label: "Agendamentos",
          icon: <Clock className="h-4 w-4" />,
          component: <AppointmentManagement />,
        },
        {
          key: "users" as TabKey,
          label: "Usuários",
          icon: <Users className="h-4 w-4" />,
          component: <UserManagement />,
        },
        {
          key: "chairs" as TabKey,
          label: "Cadeiras",
          icon: <Users className="h-4 w-4" />,
          component: <ChairManagement />,
        },
        {
          key: "schedules" as TabKey,
          label: "Gestão de disponibilidade",
          icon: <Calendar className="h-4 w-4" />,
          component: <ScheduleManagement />,
        },
        {
          key: "dashboard" as TabKey,
          label: "Dashboard",
          icon: <Home className="h-4 w-4" />,
          component: <Dashboard />,
        },
      ];
    }

    if (userRole === "attendant") {
      return [
        {
          key: "appointments" as TabKey,
          label: "Agendamentos",
          icon: <Clock className="h-4 w-4" />,
          component: <AppointmentManagement />,
        },
        {
          key: "users" as TabKey,
          label: "Usuários",
          icon: <Users className="h-4 w-4" />,
          component: <UserManagement />,
        },
        {
          key: "chairs" as TabKey,
          label: "Cadeiras",
          icon: <Users className="h-4 w-4" />,
          component: <ChairManagement />,
        },
        {
          key: "dashboard" as TabKey,
          label: "Dashboard",
          icon: <Home className="h-4 w-4" />,
          component: <Dashboard />,
        },
      ];
    }

    if (userRole === "user") {
      return [
        {
          key: "appointments" as TabKey,
          label: "Agendamentos",
          icon: <Clock className="h-4 w-4" />,
          component: <AppointmentManagement />,
        },
        {
          key: "chairs" as TabKey,
          label: "Cadeiras",
          icon: <Users className="h-4 w-4" />,
          component: <ChairManagement />,
        },
      ];
    }

    return [];
  };

  const tabs: Tab[] = getTabsForRole();

  // Check if user has permission for the active tab
  React.useEffect(() => {
    const allowedTabs = tabs.map((tab) => tab.key);
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab("appointments");
    }
  }, [activeTab, userRole, tabs]);

  const activeTabComponent =
    tabs.find((tab) => tab.key === activeTab)?.component || children;

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey as TabKey);
  };

  const handleProfileClick = () => {
    router.push("/user");
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
          onProfileClick={handleProfileClick}
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

        <div className={cn("p-4 sm:p-6")}>{activeTabComponent}</div>
      </main>
    </div>
  );
};

export default Layout;
