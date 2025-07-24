"use client";

import React, { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Users, Clock, UserCheck } from "lucide-react";
import { cn } from "@/app/lib/utils";
import PendingApprovals from "./PendingApprovals";
import RegisteredUsers from "./RegisteredUsers";
import {
  pendingCountAtom,
  totalUsersCountAtom,
} from "@/app/atoms/userManagementAtoms";

type TabType = "pending" | "users" | "chairs";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [pendingCount] = useAtom(pendingCountAtom);
  const [totalUsersCount] = useAtom(totalUsersCountAtom);

  const tabs = [
    {
      key: "pending" as TabType,
      label: "Aprovações Pendentes",
      icon: Clock,
      count: pendingCount,
      component: <PendingApprovals />,
    },
    {
      key: "users" as TabType,
      label: "Usuários Cadastrados",
      icon: UserCheck,
      count: totalUsersCount,
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
                  {tab.count > 0 && (
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-black/10 text-black"
                      )}
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

      <div>{activeTabData?.component}</div>
    </div>
  );
};

export default UserManagement;
