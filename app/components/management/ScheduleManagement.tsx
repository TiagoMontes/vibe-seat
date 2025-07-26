"use client";

import React, { useEffect } from "react";
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
} from "lucide-react";
import { useSchedules } from "@/app/hooks/useSchedules";
import { useToast } from "@/app/hooks/useToast";
import { useConfirm } from "@/app/hooks/useConfirm";
import {
  scheduleModalOpenAtom,
  scheduleEditModalOpenAtom,
  selectedScheduleAtom,
} from "@/app/atoms/scheduleAtoms";
import {
  formatDateRange,
  generateTimeSlots,
} from "@/app/schemas/scheduleSchema";
import { Schedule } from "@/app/types/api";
import ScheduleModal from "@/app/components/modal/ScheduleModal";

const ScheduleHeader: React.FC = () => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          Configuração de Horários
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Configure os dias e horários disponíveis para agendamento
        </p>
      </div>
    </div>
  </div>
);

interface ScheduleCardProps {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onEdit,
  onDelete,
  loading,
}) => {
  const allSlots: string[] = [];
  schedule.timeRanges.forEach((range) => {
    if (range.start && range.end) {
      const slots = generateTimeSlots(range.start, range.end);
      allSlots.push(...slots);
    }
  });

  const now = new Date();
  const validFrom = schedule.validFrom ? new Date(schedule.validFrom) : null;
  const validTo = schedule.validTo ? new Date(schedule.validTo) : null;

  const getStatusIcon = () => {
    if (validFrom && now < validFrom)
      return <XCircle className="h-4 w-4 text-red-600" />;
    if (validTo && now > validTo)
      return <XCircle className="h-4 w-4 text-red-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusText = () => {
    if (validFrom && now < validFrom) return "Futuro";
    if (validTo && now > validTo) return "Expirado";
    return "Ativo";
  };

  const getStatusColorClass = () => {
    if (validFrom && now < validFrom) return "bg-yellow-100 text-yellow-800";
    if (validTo && now > validTo) return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Configuração de Horários
              </h3>
              <p className="text-sm text-gray-600">
                {(schedule.days?.length || schedule.dayIds?.length || 0)} dia(s) configurado(s)
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
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

        <div className="mb-4 sm:mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Dias da Semana:
          </p>
          <div className="flex flex-wrap gap-2">
            {schedule.days ? (
              schedule.days.map((day) => (
                <span
                  key={day.id}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {day.name}
                </span>
              ))
            ) : (
              (schedule.dayIds || []).map((dayId: number) => (
                <span
                  key={dayId}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  Dia {dayId}
                </span>
              ))
            )}
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
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
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

        <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            onClick={() => onEdit(schedule)}
            variant="outline"
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Edit className="h-4 w-4" />
            <span className="sm:inline">Editar Configuração</span>
          </Button>
          <Button
            onClick={() => onDelete(schedule.id)}
            variant="destructive"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sm:inline">Excluir</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface EmptyStateProps {
  onCreateSchedule: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateSchedule }) => (
  <div className="text-center py-8 sm:py-12 px-4">
    <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4 sm:mb-6" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Nenhuma configuração encontrada
    </h3>
    <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
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

const ScheduleManagement: React.FC = () => {
  const [, setIsCreateModalOpen] = useAtom(scheduleModalOpenAtom);
  const [, setIsEditModalOpen] = useAtom(scheduleEditModalOpenAtom);
  const [, setSelectedSchedule] = useAtom(selectedScheduleAtom);

  const { fetchSchedules, deleteSchedule, schedule, loading } = useSchedules();
  const { success, error: showError } = useToast();
  const { confirm, ConfirmComponent } = useConfirm();

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleDeleteSchedule = async (id: number) => {
    const confirmed = await confirm({
      title: "Excluir Configuração",
      description:
        "Tem certeza que deseja excluir esta configuração? Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      destructive: true,
    });

    if (confirmed) {
      try {
        await deleteSchedule(id);
        success("Configuração excluída com sucesso!");
      } catch (err) {
        console.error(err);
        showError("Erro ao excluir configuração");
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <ScheduleHeader />

      {schedule ? (
        <div className="mt-4 sm:mt-6">
          <ScheduleCard
            schedule={schedule}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
            loading={loading}
          />
        </div>
      ) : (
        <EmptyState onCreateSchedule={() => setIsCreateModalOpen(true)} />
      )}

      <ScheduleModal />
      <ConfirmComponent />
    </div>
  );
};

export default ScheduleManagement;
