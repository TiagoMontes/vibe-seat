"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/app/hooks/useDashboard";
import { StatCard } from "@/app/components/dashboard/StatCard";
import { RecentAppointments } from "@/app/components/dashboard/RecentAppointments";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent
} from "@/app/components/ui/card";
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
  AlertCircle
} from "lucide-react";
import { DashboardResponse } from "@/app/types/api";
import { useUserData } from "@/app/hooks/useUserData";

export const Dashboard: React.FC = () => {
  const { getDashboard } = useDashboard();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboard();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        setLoading(false);
      }
    };
    fetchData();
  }, [getDashboard]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Visão geral do sistema</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Carregando...
          </Button>
        </div>

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Visão geral do sistema</p>
          </div>
          <Button onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Visão geral do sistema • Última atualização: {data?.lastUpdated}
          </p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        {user && user.role === 'admin' && (
          <StatCard
            title="Aprovações Pendentes"
            value={data.overview.pendingApprovals}
            icon={AlertCircle}
            color="yellow"
            description="Aguardando aprovação"
          />
        )}
      </div>

      {/* Today and Tomorrow */}
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

      {/* Chairs Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {user && user.role !== 'admin' && data.userAppointments && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
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

      <RecentAppointments appointments={data.recentAppointments} />
    </div>
  );
};
