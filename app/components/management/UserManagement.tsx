"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Users, Clock, UserCheck } from "lucide-react";
import { cn } from "@/app/lib/utils";
import PendingApprovals from "@/app/components/subTab/PendingApprovals";
import RegisteredUsers from "@/app/components/subTab/RegisteredUsers";

type TabType = "pending" | "users";

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  const tabs = [
    {
      key: "pending" as TabType,
      label: "Aprovações Pendentes",
      icon: Clock,
      component: <PendingApprovals />,
    },
    {
      key: "users" as TabType,
      label: "Usuários Cadastrados",
      icon: UserCheck,
      component: <RegisteredUsers />,
    },
  ];

  const activeTabData = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
        <Users className="h-8 w-8 text-black" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
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
          <div className="flex flex-col sm:flex-row gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <Button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium border transition-colors",
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="transition-opacity animate-fade-in">
        {activeTabData?.component}
      </div>
    </div>
  );
};

export default UserManagement;
