"use client";

import React from "react";
import { cn } from "@/app/lib/utils";
import { Button } from "../components/ui/button";
import { LogOut, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  userName = "Usuário",
  userRole = "Admin",
  onLogout,
}) => {
  return (
    <div className={cn("min-h-screen bg-background flex", className)}>
      {/* Sidebar */}
      <aside className="flex flex-col max-w-[300px] w-full shadow-lg">
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-gray-300">
          <h1 className="text-xl font-bold text-foreground">Vibe Seat</h1>
        </div>

        {/* Menu de Opções */}
        <nav className="flex flex-col h-full p-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <button
              key={index}
              className="cursor-pointer hover:bg-green-400 w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Opção {index + 1}
            </button>
          ))}
        </nav>

        {/* Área do Usuário */}
        <div className="p-4 border-t border-gray-300 flex flex-col gap-4">
          <div className="flex items-center gap-2 h-full">
            <User />
            <div className="flex flex-col justify-between h-full">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userRole}
              </p>
            </div>
          </div>

          <Button onClick={onLogout} className="flex">
            <LogOut />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
