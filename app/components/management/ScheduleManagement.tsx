"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  Timer,
  BarChart3,
} from "lucide-react";
import { useSchedules } from "@/app/hooks/useSchedules";
import { useToast } from "@/app/hooks/useToast";
import {
  scheduleModalOpenAtom,
  scheduleEditModalOpenAtom,
  selectedScheduleAtom,
} from "@/app/atoms/scheduleAtoms";
import {
  Schedule as ScheduleSchema,
  formatDateRange,
  generateTimeSlots,
} from "@/app/schemas/scheduleSchema";
import { Schedule } from "@/app/types/api";
import ScheduleModal from "@/app/components/modal/ScheduleModal";

const ScheduleHeader = ({
  onCreateSchedule,
  schedule,
}: {
  onCreateSchedule: () => void;
  schedule: Schedule | undefined;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Calendar className="h-8 w-8 text-black" />
      <div>
        <h1 className="text-3xl font-bold text-black">
          Configuração de Horários
        </h1>
        <p className="text-gray-600">
          Configure os dias e horários disponíveis para agendamento
        </p>
      </div>
    </div>
  </div>
);

const StatCard = ({
  label,
  value,
  icon: Icon,
  valueColor,
  iconColor,
}: {
  label: string;
  value: number;
  icon: any;
  valueColor: string;
  iconColor: string;
}) => (
  <Card className="border border-gray-200">
    <CardContent className="p-4 h-[100px] flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col justify-center min-h-[52px]">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <div className="w-16 h-8 flex items-center">
            <p
              className={`text-2xl font-bold ${valueColor} tabular-nums leading-none`}
            >
              {value}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatsGrid = ({ stats }: { stats: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
    {[
      {
        key: "total",
        label: "Total de Configurações",
        value: stats.total,
        icon: Calendar,
        valueColor: "text-black",
        iconColor: "text-gray-400",
      },
      {
        key: "activePeriods",
        label: "Dias Ativos",
        value: stats.activePeriods,
        icon: CalendarDays,
        valueColor: "text-green-600",
        iconColor: "text-green-400",
      },
      {
        key: "totalSlots",
        label: "Total de Slots",
        value: stats.totalSlots,
        icon: Timer,
        valueColor: "text-blue-600",
        iconColor: "text-blue-400",
      },
      {
        key: "averageSlots",
        label: "Média de Slots por Dia",
        value: stats.averageSlotsPerDay,
        icon: BarChart3,
        valueColor: "text-purple-600",
        iconColor: "text-purple-400",
      },
    ].map((stat) => (
      <StatCard
        key={stat.key}
        label={stat.label}
        value={stat.value}
        icon={stat.icon}
        valueColor={stat.valueColor}
        iconColor={stat.iconColor}
      />
    ))}
  </div>
);

const ScheduleCard = ({
  schedule,
  onEdit,
  onDelete,
  loading,
}: {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}) => {
  const allSlots: string[] = [];
  schedule.timeRanges.forEach((range) => {
    if (range.start && range.end) {
      const slots = generateTimeSlots(range.start, range.end);
      allSlots.push(...slots);
    }
  });

  const getStatusIcon = () => {
    const now = new Date();
    const validFrom = schedule.validFrom ? new Date(schedule.validFrom) : null;
    const validTo = schedule.validTo ? new Date(schedule.validTo) : null;

    if (validFrom && now < validFrom)
      return <XCircle className="h-4 w-4 text-red-600" />;
    if (validTo && now > validTo)
      return <XCircle className="h-4 w-4 text-red-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusText = () => {
    const now = new Date();
    const validFrom = schedule.validFrom ? new Date(schedule.validFrom) : null;
    const validTo = schedule.validTo ? new Date(schedule.validTo) : null;

    if (validFrom && now < validFrom) return "Futuro";
    if (validTo && now > validTo) return "Expirado";
    return "Ativo";
  };

  const getStatusColorClass = () => {
    const now = new Date();
    const validFrom = schedule.validFrom ? new Date(schedule.validFrom) : null;
    const validTo = schedule.validTo ? new Date(schedule.validTo) : null;

    if (validFrom && now < validFrom) return "bg-yellow-100 text-yellow-800";
    if (validTo && now > validTo) return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="text-xl font-semibold text-black">
                Configuração de Horários
              </h3>
              <p className="text-sm text-gray-600">
                {(schedule as any).days?.length || schedule.dayIds?.length || 0}{" "}
                dia(s) configurado(s)
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass()}`}
          >
            {getStatusIcon()}
            {getStatusText()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Período de Validade:
            </p>
            <p className="text-sm text-gray-600">
              {formatDateRange(schedule.validFrom, schedule.validTo)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Total de Slots por dia:
            </p>
            <p className="text-sm text-gray-600">
              {allSlots.length} slots disponíveis
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Dias da Semana:
          </p>
          <div className="flex flex-wrap gap-2">
            {((schedule as any).days || []).map((day: any) => (
              <span
                key={day.id}
                className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize"
              >
                {day.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Intervalos de Horário:
          </p>
          <div className="space-y-2">
            {schedule.timeRanges.map((range, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {range.start} - {range.end}
                </span>
                <span className="text-xs text-gray-500">
                  {generateTimeSlots(range.start, range.end).length} slots
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end items-center gap-3">
          <Button
            onClick={() => onEdit(schedule)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar Configuração
          </Button>
          <Button
            onClick={() => onDelete(schedule.id)}
            variant="destructive"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ onCreateSchedule }: { onCreateSchedule: () => void }) => (
  <div className="text-center py-12">
    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-6" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Nenhuma configuração encontrada
    </h3>
    <p className="text-gray-500 mb-6">
      Configure os dias e horários disponíveis para agendamento
    </p>
    <Button
      onClick={onCreateSchedule}
      className="flex items-center gap-2 mx-auto"
    >
      <Plus className="h-4 w-4" />
      Criar Configuração
    </Button>
  </div>
);

const ScheduleManagement = () => {
  const [, setIsCreateModalOpen] = useAtom(scheduleModalOpenAtom);
  const [, setIsEditModalOpen] = useAtom(scheduleEditModalOpenAtom);
  const [, setSelectedSchedule] = useAtom(selectedScheduleAtom);

  const { fetchSchedules, deleteSchedule, schedule, loading } = useSchedules();
  const { success, error } = useToast();

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleEditSchedule = (schedule: Schedule) => {
    // Usar a estrutura real da API Schedule
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleDeleteSchedule = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta configuração?")) {
      try {
        await deleteSchedule();
        success("Configuração excluída com sucesso!");
      } catch (err) {
        console.error(err);
        error("Erro ao excluir configuração");
      }
    }
  };

  return (
    <div className="space-y-6">
      <ScheduleHeader
        onCreateSchedule={() => setIsCreateModalOpen(true)}
        schedule={schedule}
      />

      {schedule ? (
        <>
          <ScheduleCard
            schedule={schedule}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
            loading={loading}
          />
        </>
      ) : (
        <EmptyState onCreateSchedule={() => setIsCreateModalOpen(true)} />
      )}

      <ScheduleModal />
    </div>
  );
};

export default ScheduleManagement;
