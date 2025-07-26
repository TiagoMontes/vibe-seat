"use client";

import React, { useState } from "react";
import { cn } from "@/app/lib/utils";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings,
} from "lucide-react";

interface SidebarAccordionProps {
  tabs: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

const SidebarAccordion: React.FC<SidebarAccordionProps> = ({
  tabs,
  activeTab,
  onTabChange,
  userName = "Usuário",
  userRole = "Admin",
  onLogout,
  onProfileClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <aside
      className={cn(
        "border-r border-gray-300 flex flex-col bg-white text-black h-screen transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Header da Sidebar */}
      <div
        className={cn(
          "border-b border-gray-300 flex items-center justify-between h-20",
          isExpanded ? "p-6" : "p-4"
        )}
      >
        {isExpanded ? (
          <>
            <h1 className="text-xl font-bold">Vibe Seat</h1>
            <Button
              onClick={toggleExpanded}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <Button
              onClick={toggleExpanded}
              variant="ghost"
              size="sm"
              className="h-6 w-6"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Menu de Opções com Accordion */}
      <div
        className="flex-1 p-2 flex flex-col"
      >
        {isExpanded ? (
          <div className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "w-full justify-start text-sm font-medium rounded-md h-10 transition-colors",
                  activeTab === tab.key
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-black/5"
                )}
              >
                {tab.icon}
                <span className="ml-3">{tab.label}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "w-full justify-center h-10 p-0 rounded-md transition-colors",
                  activeTab === tab.key
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-black/5"
                )}
                title={tab.label}
              >
                {tab.icon}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Área do Usuário */}
      <div
        className="border-t  border-gray-300 p-2"
      >
        {isExpanded ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center  gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-lg font-bold truncate">{userName}</p>
                <p className="text-xs truncate">{userRole}</p>
              </div>
            </div>

            <div className="space-y-1">
              <Button
                onClick={onProfileClick}
                variant="outline"
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Meu Perfil</span>
              </Button>
              
              <Button
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-10 border rounded-full flex items-center justify-center">
              {userName.charAt(0).toUpperCase()}
            </div>
            <Button
              onClick={onProfileClick}
              variant="ghost"
              size="sm"
              className="h-8 p-0 bg-gray-100 w-full hover:bg-gray-200"
              title="Meu Perfil"
            >
              <Settings className="h-4 w-4 text-gray-700" />
            </Button>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="h-8 p-0 bg-black w-full"
              title="Sair"
            >
              <LogOut className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarAccordion;
