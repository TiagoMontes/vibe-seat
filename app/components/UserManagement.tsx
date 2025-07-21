"use client";

import React, { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Users, Clock, UserCheck } from "lucide-react";
import PendingApprovals from "./PendingApprovals";
import RegisteredUsers from "./RegisteredUsers";
import {
  pendingCountAtom,
  totalUsersCountAtom,
} from "@/app/atoms/userManagementAtoms";
import { useUserManagementData } from "@/app/hooks/useUserManagementData";

type TabType = "pending" | "users";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [pendingCount] = useAtom(pendingCountAtom);
  const [totalUsersCount] = useAtom(totalUsersCountAtom);

  // Inicializar dados uma vez
  useUserManagementData();

  const tabs = [
    {
      key: "pending" as TabType,
      label: "Aprovações Pendentes",
      icon: Clock,
      count: pendingCount,
      component: <PendingApprovals />,
      color: "blue",
    },
    {
      key: "users" as TabType,
      label: "Usuários Cadastrados",
      icon: UserCheck,
      count: totalUsersCount,
      component: <RegisteredUsers />,
      color: "blue",
    },
  ];

  const getTabButtonClass = (tab: (typeof tabs)[0], isActive: boolean) => {
    const baseClass =
      "flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors";

    if (isActive) {
      return `${baseClass} bg-${tab.color}-600 text-white shadow-sm`;
    }

    return `${baseClass} text-gray-600 hover:text-gray-900 hover:bg-gray-100`;
  };

  const activeTabData = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">
            Gerencie aprovações e visualize usuários cadastrados
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <Button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  variant="ghost"
                  className={getTabButtonClass(tab, isActive)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : `bg-${tab.color}-100 text-${tab.color}-800`
                      }
                    `}
                    >
                      {tab.count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da Tab Ativa */}
      <div>{activeTabData?.component}</div>
    </div>
  );
};

export default UserManagement;
