"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/app/components/ui/dialog";
import { useSchedules } from "@/app/hooks/useSchedules";
import { useDaysOfWeek } from "@/app/hooks/useDaysOfWeek";
import { useToast } from "@/app/hooks/useToast";
import {
  scheduleModalOpenAtom,
  scheduleEditModalOpenAtom,
  selectedScheduleAtom,
} from "@/app/atoms/scheduleAtoms";
import {
  apiScheduleZodSchema,
  ApiScheduleZodFormData,
  generateTimeSlots,
} from "@/app/schemas/scheduleSchema";
import { CreateScheduleRequest } from "@/app/types/api";
import { Plus, Trash2 } from "lucide-react";

const ScheduleModal = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useAtom(
    scheduleModalOpenAtom
  );
  const [isEditModalOpen, setIsEditModalOpen] = useAtom(
    scheduleEditModalOpenAtom
  );
  const [selectedSchedule, setSelectedSchedule] = useAtom(selectedScheduleAtom);

  const { createSchedule, updateSchedule, loading } = useSchedules();

  const { listDays } = useDaysOfWeek();
  const { success, error } = useToast();

  const isEdit = isEditModalOpen && selectedSchedule;
  const isOpen = isCreateModalOpen || isEditModalOpen;

  const [selectedDayIds, setSelectedDayIds] = useState<number[]>([]);
  const [previewSlots, setPreviewSlots] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<{ id: number; name: string; }[]>([]);
  const [daysLoading, setDaysLoading] = useState(false);

  const form = useForm<ApiScheduleZodFormData>({
    resolver: zodResolver(apiScheduleZodSchema),
    defaultValues: {
      timeRanges: [{ start: "", end: "" }],
      validFrom: "",
      validTo: "",
      dayIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "timeRanges",
  });

  const watchedTimeRanges = form.watch("timeRanges");

  // Buscar dias da semana do backend quando o modal abrir
  useEffect(() => {
    const fetchDays = async () => {
      if (!isOpen || availableDays.length > 0) return;

      try {
        setDaysLoading(true);
        const response = await listDays();
        if (response?.days) {
          setAvailableDays(response.days);
        }
      } catch (err) {
        console.error("Erro ao buscar dias da semana:", err);
        error("Erro ao carregar dias da semana");
      } finally {
        setDaysLoading(false);
      }
    };

    fetchDays();
  }, [isOpen, listDays, availableDays.length, error]);

  useEffect(() => {
    if (isEdit && selectedSchedule) {
      // Carregar timeRanges
      const timeRanges = selectedSchedule.timeRanges || [];
      form.setValue("timeRanges", timeRanges);

      // Carregar datas de validade
      form.setValue(
        "validFrom",
        selectedSchedule.validFrom
          ? selectedSchedule.validFrom.split("T")[0]
          : ""
      );
      form.setValue(
        "validTo",
        selectedSchedule.validTo ? selectedSchedule.validTo.split("T")[0] : ""
      );

      // Carregar dayIds - support both new (days array) and old (dayIds array) formats
      let dayIds: number[] = [];
      if (selectedSchedule.days && selectedSchedule.days.length > 0) {
        // New format: extract IDs from days array
        dayIds = selectedSchedule.days.map((day) => day.id);
      } else if (selectedSchedule.dayIds && selectedSchedule.dayIds.length > 0) {
        // Old format: use dayIds directly
        dayIds = selectedSchedule.dayIds;
      }
      setSelectedDayIds(dayIds);
      // IMPORTANT: Update the form field to prevent validation errors
      form.setValue("dayIds", dayIds);
    } else if (isCreateModalOpen) {
      form.reset();
      setSelectedDayIds([]);
    }
  }, [isEdit, selectedSchedule, isCreateModalOpen, form]);

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
    form.reset();
  };

  const handleDayToggle = (dayId: number) => {
    setSelectedDayIds((prev) => {
      const newDayIds = prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId].sort();

      form.setValue("dayIds", newDayIds);
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

  const onSubmit = async (data: ApiScheduleZodFormData) => {
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
        await updateSchedule(scheduleData, selectedSchedule.id);
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
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <DialogClose onClose={handleClose} />

        <DialogHeader className="px-4 sm:px-6 py-4 sm:py-6 border-b bg-white">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900">
            {isEdit ? "Editar Configuração" : "Nova Configuração de Horário"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600 mt-2">
            {isEdit
              ? "Edite a configuração de horário selecionada."
              : "Configure os dias e horários disponíveis para agendamento."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 sm:space-y-8"
            >
            {/* Dias da Semana */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Dias da Semana *
              </Label>
              {daysLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    Carregando dias da semana...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableDays.map((day) => (
                    <label
                      key={day.id}
                      className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedDayIds.includes(day.id)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDayIds.includes(day.id)}
                        onChange={() => handleDayToggle(day.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium capitalize">
                        {day.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {form.formState.errors.dayIds && (
                <p className="text-sm text-red-500">{form.formState.errors.dayIds.message}</p>
              )}
            </div>

            {/* Intervalos de Horário */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Label className="text-base font-medium text-gray-900">
                  Intervalos de Horário *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTimeRange}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Horário
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-3 sm:p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <FormField
                        control={form.control}
                        name={`timeRanges.${index}.start`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Início
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`timeRanges.${index}.end`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Fim
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimeRange(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2 sm:mt-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {form.formState.errors.timeRanges && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.timeRanges.message}
                </p>
              )}
            </div>

            {/* Preview dos Slots */}
            {previewSlots.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium text-gray-900">
                  Preview - Slots de 30 minutos ({previewSlots.length} slots)
                </Label>
                <div className="max-h-32 sm:max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {previewSlots.map((slot, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Período de Validade */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-900">
                Período de Validade (opcional)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Data de Início
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Data de Fim
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-gray-500">
                Se não informado, a configuração será válida indefinidamente.
              </p>
            </div>

            {/* Resumo */}
            {!isEdit &&
              selectedDayIds.length > 0 &&
              previewSlots.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-blue-800">
                        Dias selecionados: {selectedDayIds.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">
                        Intervalos: {watchedTimeRanges?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">
                        Total: {previewSlots.length * selectedDayIds.length}{" "}
                        slots
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  daysLoading ||
                  (!isEdit && selectedDayIds.length === 0) ||
                  watchedTimeRanges?.length === 0
                }
                className="w-full sm:w-auto sm:ml-auto"
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
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
