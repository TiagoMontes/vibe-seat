"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  scheduleModalOpenAtom,
  scheduleEditModalOpenAtom,
  selectedScheduleAtom,
} from "@/app/atoms/scheduleAtoms";
import {
  scheduleSchema,
  scheduleUpdateSchema,
  ScheduleFormData,
  ScheduleUpdateFormData,
  getDayOptions,
  getDayLabel,
  generateTimeSlots,
} from "@/app/schemas/scheduleSchema";

const ScheduleModal = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useAtom(
    scheduleModalOpenAtom
  );
  const [isEditModalOpen, setIsEditModalOpen] = useAtom(
    scheduleEditModalOpenAtom
  );
  const [selectedSchedule, setSelectedSchedule] = useAtom(selectedScheduleAtom);

  const { createSchedule, updateSchedule, createLoading, updateLoading } =
    useSchedules();

  const isEdit = isEditModalOpen && selectedSchedule;
  const isOpen = isCreateModalOpen || isEditModalOpen;

  // For creating schedules, we need a form that handles multiple days
  // For editing, we handle a single schedule at a time
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [previewSlots, setPreviewSlots] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(scheduleSchema),
    defaultValues: {
      daysOfWeek: [],
      timeStart: "",
      timeEnd: "",
      validFrom: "",
      validTo: "",
    },
  });

  const watchedTimeStart = watch("timeStart");
  const watchedTimeEnd = watch("timeEnd");

  // Reset form when modal opens/closes or schedule changes
  useEffect(() => {
    if (isEdit && selectedSchedule) {
      // For editing, we're editing a single day
      setValue("timeStart", selectedSchedule.timeStart);
      setValue("timeEnd", selectedSchedule.timeEnd);
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
      setSelectedDays([selectedSchedule.dayOfWeek]);
    } else if (isCreateModalOpen) {
      reset({
        daysOfWeek: [],
        timeStart: "",
        timeEnd: "",
        validFrom: "",
        validTo: "",
      });
      setSelectedDays([]);
    }
  }, [isEdit, selectedSchedule, isCreateModalOpen, setValue, reset]);

  // Update preview slots when times change
  useEffect(() => {
    if (
      watchedTimeStart &&
      watchedTimeEnd &&
      watchedTimeEnd > watchedTimeStart
    ) {
      try {
        const slots = generateTimeSlots(watchedTimeStart, watchedTimeEnd);
        setPreviewSlots(slots);
      } catch (error) {
        setPreviewSlots([]);
      }
    } else {
      setPreviewSlots([]);
    }
  }, [watchedTimeStart, watchedTimeEnd]);

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedSchedule(null);
    setSelectedDays([]);
    setPreviewSlots([]);
    reset();
  };

  const handleDayToggle = (dayOfWeek: number) => {
    if (isEdit) return; // Can't change day when editing

    setSelectedDays((prev) => {
      const newDays = prev.includes(dayOfWeek)
        ? prev.filter((d) => d !== dayOfWeek)
        : [...prev, dayOfWeek].sort();

      setValue("daysOfWeek", newDays);
      return newDays;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      if (isEdit && selectedSchedule) {
        // For editing, create update data without daysOfWeek
        const updateData: ScheduleUpdateFormData = {
          timeStart: data.timeStart,
          timeEnd: data.timeEnd,
          validFrom:
            data.validFrom && data.validFrom.trim()
              ? new Date(data.validFrom + "T00:00:00").toISOString()
              : null,
          validTo:
            data.validTo && data.validTo.trim()
              ? new Date(data.validTo + "T23:59:59.999").toISOString()
              : null,
        };

        await updateSchedule(selectedSchedule.id, updateData);
      } else {
        // For creating, use the form data directly
        const createData: ScheduleFormData = {
          daysOfWeek: selectedDays,
          timeStart: data.timeStart,
          timeEnd: data.timeEnd,
          validFrom:
            data.validFrom && data.validFrom.trim()
              ? new Date(data.validFrom + "T00:00:00").toISOString()
              : null,
          validTo:
            data.validTo && data.validTo.trim()
              ? new Date(data.validTo + "T23:59:59.999").toISOString()
              : null,
        };

        await createSchedule(createData);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert(
        error instanceof Error ? error.message : "Erro ao salvar configuração"
      );
    }
  };

  const dayOptions = getDayOptions();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="relative w-full max-w-[600px] min-w-[500px] max-h-[90vh] overflow-y-auto">
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
          {/* Days of Week Selection (only for creating) */}
          {!isEdit && (
            <div className="space-y-3">
              <Label>Dias da Semana *</Label>
              <div className="grid grid-cols-2 gap-2">
                {dayOptions.map((day) => (
                  <label
                    key={day.value}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDays.includes(day.value)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                ))}
              </div>
              {errors.daysOfWeek && (
                <p className="text-sm text-red-500">
                  {errors.daysOfWeek.message}
                </p>
              )}
            </div>
          )}

          {/* Current Day (for editing) */}
          {isEdit && selectedSchedule && (
            <div className="space-y-2">
              <Label>Dia da Semana</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">
                  {getDayLabel(selectedSchedule.dayOfWeek)}
                </span>
              </div>
            </div>
          )}

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeStart">Horário de Início *</Label>
              <Input
                id="timeStart"
                type="time"
                {...register("timeStart")}
                className={errors.timeStart ? "border-red-500" : ""}
              />
              {errors.timeStart && (
                <p className="text-sm text-red-500">
                  {errors.timeStart.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeEnd">Horário de Fim *</Label>
              <Input
                id="timeEnd"
                type="time"
                {...register("timeEnd")}
                className={errors.timeEnd ? "border-red-500" : ""}
              />
              {errors.timeEnd && (
                <p className="text-sm text-red-500">{errors.timeEnd.message}</p>
              )}
            </div>
          </div>

          {/* Preview Slots */}
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

          {/* Validity Period */}
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

          {/* Summary for Create Mode */}
          {!isEdit &&
            selectedDays.length > 0 &&
            watchedTimeStart &&
            watchedTimeEnd && (
              <div className="space-y-2">
                <Label>Resumo da Configuração</Label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Dias selecionados:{" "}
                    {selectedDays.map((day) => getDayLabel(day)).join(", ")}
                  </p>
                  <p className="text-sm text-blue-700 mb-1">
                    Horário: {watchedTimeStart} - {watchedTimeEnd}
                  </p>
                  <p className="text-sm text-blue-700">
                    Total de slots: {previewSlots.length} ×{" "}
                    {selectedDays.length} dias ={" "}
                    {previewSlots.length * selectedDays.length} slots
                  </p>
                </div>
              </div>
            )}

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createLoading || updateLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                createLoading ||
                updateLoading ||
                (!isEdit && selectedDays.length === 0)
              }
              className="flex-1"
            >
              {createLoading || updateLoading
                ? isEdit
                  ? "Atualizando..."
                  : "Criando..."
                : isEdit
                ? "Atualizar"
                : "Criar Configurações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
