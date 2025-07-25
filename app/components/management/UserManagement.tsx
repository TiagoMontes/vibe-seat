"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Users, Clock, UserCheck } from "lucide-react";
import { cn } from "@/app/lib/utils";
import PendingApprovals from "@/app/components/subTab/PendingApprovals";
import RegisteredUsers from "@/app/components/subTab/RegisteredUsers";

type TabType = "pending" | "users" | "chairs";

const UserManagement = () => {
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-black" />
        <div>
          <h1 className="text-3xl font-bold text-black">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">
            Gerencie aprovações e visualize usuários cadastrados
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-col lg:flex-row">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <Button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 bg-white text-black px-4 py-3 rounded-md font-medium transition-colors",
                    isActive ? "bg-black text-white" : "hover:bg-black/5"
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

      <div>{activeTabData?.component}</div>
    </div>
  );
};

export default UserManagement;
