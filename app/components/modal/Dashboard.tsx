"use client";

import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { useDashboard } from "@/app/hooks/useDashboard";
import { userAtom } from "@/app/atoms/userAtoms";
import { StatCard } from "@/app/components/dashboard/StatCard";
import { RecentAppointments } from "@/app/components/dashboard/RecentAppointments";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Users,
  Armchair,
  Calendar,
  Clock,
  RefreshCw,
  TrendingUp,
  Activity,
  Wrench,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { getDashboard, data, loading, error } = useDashboard();
  const [user] = useAtom(userAtom);

  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

  const refreshData = async () => {
    await getDashboard();
  };

  const renderHeader = (isLoading = false) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Visão geral do sistema
          {!isLoading &&
            data?.lastUpdated &&
            ` • Última atualização: ${data.lastUpdated}`}
        </p>
      </div>
      <Button
        onClick={refreshData}
        variant={isLoading ? "default" : "outline"}
        disabled={isLoading}
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
        />
        {isLoading ? "Carregando..." : "Atualizar"}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {renderHeader(true)}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        {renderHeader()}
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao carregar dashboard
            </h3>
            <p className="text-gray-600 mb-4">
              {error || "Não foi possível carregar os dados do dashboard"}
            </p>
            <Button onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      {renderHeader()}

      {/* Visão geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuários"
          value={data.overview.totalUsers}
          icon={Users}
          color="blue"
          description="Usuários cadastrados no sistema"
        />
        <StatCard
          title="Total de Cadeiras"
          value={data.overview.totalChairs}
          icon={Armchair}
          color="green"
          description="Cadeiras disponíveis"
        />
        <StatCard
          title="Total de Agendamentos"
          value={data.overview.totalAppointments}
          icon={Calendar}
          color="purple"
          description="Agendamentos realizados"
        />
        {user?.role === "admin" && (
          <StatCard
            title="Aprovações Pendentes"
            value={data.overview.pendingApprovals}
            icon={AlertCircle}
            color="yellow"
            description="Aguardando aprovação"
          />
        )}
      </div>

      {/* Hoje e Amanhã */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Agendamentos Hoje"
          value={data.today.appointments}
          icon={Clock}
          color="green"
          description="Agendamentos para hoje"
        />
        <StatCard
          title="Agendamentos Amanhã"
          value={data.tomorrow.appointments}
          icon={TrendingUp}
          color="blue"
          description="Agendamentos para amanhã"
        />
      </div>

      {/* Status das cadeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Cadeiras"
          value={data.chairs.total}
          icon={Armchair}
          color="gray"
        />
        <StatCard
          title="Cadeiras Ativas"
          value={data.chairs.active}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Em Manutenção"
          value={data.chairs.maintenance}
          icon={Wrench}
          color="yellow"
        />
        <StatCard
          title="Inativas"
          value={data.chairs.inactive}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Meus agendamentos (somente para não admins) */}
      {user?.role !== "admin" && data.userAppointments && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            title="Meus Agendamentos"
            value={data.userAppointments.total}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Agendados"
            value={data.userAppointments.scheduled}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Confirmados"
            value={data.userAppointments.confirmed}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Cancelados"
            value={data.userAppointments.cancelled}
            icon={XCircle}
            color="red"
          />
          <StatCard
            title="Futuros"
            value={data.userAppointments.confirmedUpcoming}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Realizados"
            value={data.userAppointments.confirmedDone}
            icon={CheckCircle}
            color="green"
          />
        </div>
      )}

      {/* Agendamentos recentes */}
      <RecentAppointments appointments={data.recentAppointments} />
    </div>
  );
};
