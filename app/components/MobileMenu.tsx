"use client";

import React from "react";
import { Menu, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";

interface MobileMenuProps {
  tabs: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onLogout,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-2 bg-white" align="start" sideOffset={8}>
        {/* Menu Items */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <DropdownMenuItem
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors
                ${
                  activeTab === tab.key
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* User Info */}
        <div className="px-3 py-2">
          <DropdownMenuItem
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sair</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileMenu;
