"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/app/components/ui/dialog";
import { useSchedules } from "@/app/hooks/useSchedules";
import { useToast } from "@/app/hooks/useToast";
import {
  scheduleModalOpenAtom,
  scheduleEditModalOpenAtom,
  selectedScheduleAtom,
} from "@/app/atoms/scheduleAtoms";
import {
  apiScheduleSchema,
  ApiScheduleFormData,
  TimeRangeFormData,
  getDayOptions,
  generateTimeSlots,
} from "@/app/schemas/scheduleSchema";
import {
  Schedule,
  DayOfWeek,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from "@/app/types/api";
import { Plus, Trash2, Clock } from "lucide-react";

const ScheduleModal = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useAtom(
    scheduleModalOpenAtom
  );
  const [isEditModalOpen, setIsEditModalOpen] = useAtom(
    scheduleEditModalOpenAtom
  );
  const [selectedSchedule, setSelectedSchedule] = useAtom(selectedScheduleAtom);

  const {
    fetchSchedules,
    fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    schedule,
    loading,
  } = useSchedules();

  const { success, error } = useToast();

  const isEdit = isEditModalOpen && selectedSchedule;
  const isOpen = isCreateModalOpen || isEditModalOpen;

  const [selectedDayIds, setSelectedDayIds] = useState<number[]>([]);
  const [previewSlots, setPreviewSlots] = useState<string[]>([]);

  // Lista estática dos dias da semana
  const availableDays = [
    { id: 1, name: "Segunda-feira" },
    { id: 2, name: "Terça-feira" },
    { id: 3, name: "Quarta-feira" },
    { id: 4, name: "Quinta-feira" },
    { id: 5, name: "Sexta-feira" },
    { id: 6, name: "Sábado" },
    { id: 7, name: "Domingo" },
  ];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(apiScheduleSchema),
    defaultValues: {
      timeRanges: [{ start: "", end: "" }],
      validFrom: "",
      validTo: "",
      dayIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "timeRanges",
  });

  const watchedTimeRanges = watch("timeRanges");

  // Removido o useEffect que buscava dias da semana, agora usando lista estática

  useEffect(() => {
    if (isEdit && selectedSchedule) {
      // Carregar timeRanges
      const timeRanges = selectedSchedule.timeRanges || [];
      setValue("timeRanges", timeRanges);

      // Carregar datas de validade
      setValue(
        "validFrom",
        selectedSchedule.validFrom
          ? selectedSchedule.validFrom.split("T")[0]
          : ""
      );
      setValue(
        "validTo",
        selectedSchedule.validTo ? selectedSchedule.validTo.split("T")[0] : ""
      );

      // Carregar dayIds
      const dayIds = (selectedSchedule as any).days
        ? (selectedSchedule as any).days.map((day: any) => day.id)
        : selectedSchedule.dayIds || [];
      setSelectedDayIds(dayIds);
    } else if (isCreateModalOpen) {
      reset();
      setSelectedDayIds([]);
    }
  }, [isEdit, selectedSchedule, isCreateModalOpen, setValue, reset]);

  useEffect(() => {
    if (watchedTimeRanges && watchedTimeRanges.length > 0) {
      const allSlots: string[] = [];
      watchedTimeRanges.forEach((range) => {
        if (range.start && range.end && range.end > range.start) {
          try {
            const slots = generateTimeSlots(range.start, range.end);
            allSlots.push(...slots);
          } catch {
            // Ignore invalid ranges
          }
        }
      });
      setPreviewSlots(allSlots);
    } else {
      setPreviewSlots([]);
    }
  }, [watchedTimeRanges]);

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedSchedule(null);
    setSelectedDayIds([]);
    setPreviewSlots([]);
    reset();
  };

  const handleDayToggle = (dayId: number) => {
    setSelectedDayIds((prev) => {
      const newDayIds = prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId].sort();

      setValue("dayIds", newDayIds);
      return newDayIds;
    });
  };

  const addTimeRange = () => {
    append({ start: "", end: "" });
  };

  const removeTimeRange = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: ApiScheduleFormData) => {
    try {
      const scheduleData = {
        timeRanges: data.timeRanges,
        validFrom: data.validFrom
          ? new Date(`${data.validFrom}T00:00:00`).toISOString()
          : undefined,
        validTo: data.validTo
          ? new Date(`${data.validTo}T23:59:59.999`).toISOString()
          : undefined,
        dayIds: selectedDayIds,
      };

      if (isEdit && selectedSchedule) {
        await updateSchedule(scheduleData);
        success("Configuração atualizada com sucesso!");
      } else {
        // Para criar, garantir que os campos obrigatórios sejam strings
        const createData: CreateScheduleRequest = {
          timeRanges: data.timeRanges,
          validFrom: data.validFrom
            ? new Date(`${data.validFrom}T00:00:00`).toISOString()
            : "",
          validTo: data.validTo
            ? new Date(`${data.validTo}T23:59:59.999`).toISOString()
            : "",
          dayIds: selectedDayIds,
        };
        await createSchedule(createData);
        success("Configuração criada com sucesso!");
      }

      handleClose();
    } catch (err) {
      console.error("Error saving schedule:", err);
      error("Erro ao salvar configuração");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="relative w-full max-w-[700px] min-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={handleClose} />

        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Configuração" : "Nova Configuração de Horário"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edite a configuração de horário selecionada."
              : "Configure os dias e horários disponíveis para agendamento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          <div className="space-y-3">
            <Label>Dias da Semana *</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableDays.map((day) => (
                <label
                  key={day.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDayIds.includes(day.id)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDayIds.includes(day.id)}
                    onChange={() => handleDayToggle(day.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium capitalize">
                    {day.name}
                  </span>
                </label>
              ))}
            </div>
            {errors.dayIds && (
              <p className="text-sm text-red-500">{errors.dayIds.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Intervalos de Horário *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeRange}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Adicionar Horário
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`timeRanges.${index}.start`}>Início</Label>
                    <Input
                      id={`timeRanges.${index}.start`}
                      type="time"
                      {...register(`timeRanges.${index}.start` as const)}
                      className={
                        errors.timeRanges?.[index]?.start
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors.timeRanges?.[index]?.start && (
                      <p className="text-xs text-red-500">
                        {errors.timeRanges[index]?.start?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`timeRanges.${index}.end`}>Fim</Label>
                    <Input
                      id={`timeRanges.${index}.end`}
                      type="time"
                      {...register(`timeRanges.${index}.end` as const)}
                      className={
                        errors.timeRanges?.[index]?.end ? "border-red-500" : ""
                      }
                    />
                    {errors.timeRanges?.[index]?.end && (
                      <p className="text-xs text-red-500">
                        {errors.timeRanges[index]?.end?.message}
                      </p>
                    )}
                  </div>
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTimeRange(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {errors.timeRanges && (
              <p className="text-sm text-red-500">
                {errors.timeRanges.message}
              </p>
            )}
          </div>

          {previewSlots.length > 0 && (
            <div className="space-y-2">
              <Label>
                Preview - Slots de 30 minutos ({previewSlots.length} slots)
              </Label>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                <div className="flex flex-wrap gap-1">
                  {previewSlots.map((slot, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Período de Validade (opcional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Data de Início</Label>
                <Input
                  id="validFrom"
                  type="date"
                  {...register("validFrom")}
                  className={errors.validFrom ? "border-red-500" : ""}
                />
                {errors.validFrom && (
                  <p className="text-sm text-red-500">
                    {errors.validFrom.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="validTo">Data de Fim</Label>
                <Input
                  id="validTo"
                  type="date"
                  {...register("validTo")}
                  className={errors.validTo ? "border-red-500" : ""}
                />
                {errors.validTo && (
                  <p className="text-sm text-red-500">
                    {errors.validTo.message}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Se não informado, a configuração será válida indefinidamente.
            </p>
          </div>

          {!isEdit && selectedDayIds.length > 0 && previewSlots.length > 0 && (
            <div className="space-y-2">
              <Label>Resumo da Configuração</Label>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Dias selecionados: {selectedDayIds.length} dia(s)
                </p>
                <p className="text-sm text-blue-700 mb-1">
                  Intervalos: {watchedTimeRanges?.length || 0} intervalo(s)
                </p>
                <p className="text-sm text-blue-700">
                  Total de slots: {previewSlots.length} ×{" "}
                  {selectedDayIds.length} dias ={" "}
                  {previewSlots.length * selectedDayIds.length} slots
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                (!isEdit && selectedDayIds.length === 0) ||
                watchedTimeRanges?.length === 0
              }
              className="flex-1"
            >
              {loading
                ? isEdit
                  ? "Atualizando..."
                  : "Criando..."
                : isEdit
                ? "Atualizar"
                : "Criar Configuração"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
