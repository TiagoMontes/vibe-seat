"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useAppointments } from "@/app/hooks/useAppointments";
import { useChairs } from "@/app/hooks/useChairs";
import { Chair } from "@/app/schemas/chairSchema";
import { CalendarIcon, ClockIcon, CheckIcon, XIcon } from "lucide-react";

export const AppointmentModal = () => {
  const {
    modalOpen,
    closeModal,
    selectedChairId,
    setSelectedChairId,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    availableTimes,
    fetchAvailableTimes,
    createAppointment,
    createLoading,
    availableTimesLoading,
    error,
    successMessage,
    clearMessages,
  } = useAppointments();

  const { chairs, fetchChairs } = useChairs();
  const [activeChairs, setActiveChairs] = useState<Chair[]>([]);

  // Fetch chairs when modal opens
  useEffect(() => {
    if (modalOpen) {
      fetchChairs();
      clearMessages();
    }
  }, [modalOpen, fetchChairs, clearMessages]);

  // Filter active chairs
  useEffect(() => {
    setActiveChairs(chairs.filter((chair) => chair.status === "ACTIVE"));
  }, [chairs]);

  // Fetch available times when chair and date are selected
  useEffect(() => {
    if (selectedChairId && selectedDate) {
      fetchAvailableTimes(selectedChairId, selectedDate);
    }
  }, [selectedChairId, selectedDate, fetchAvailableTimes]);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  const handleSubmit = async () => {
    if (!selectedChairId || !selectedDate || !selectedTime) {
      return;
    }

    const datetimeStart = `${selectedDate}T${selectedTime}:00`;

    await createAppointment({
      chairId: selectedChairId,
      datetimeStart,
    });
  };

  const handleClose = () => {
    closeModal();
    setSelectedTime("");
  };

  const isFormValid = selectedChairId && selectedDate && selectedTime;

  return (
    <Dialog open={modalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              <XIcon className="h-4 w-4" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
              <CheckIcon className="h-4 w-4" />
              {successMessage}
            </div>
          )}

          {/* Chair Selection */}
          <div className="space-y-2">
            <Label htmlFor="chair">Cadeira</Label>
            <Select
              value={selectedChairId?.toString() || ""}
              onValueChange={(value) => {
                setSelectedChairId(parseInt(value));
                setSelectedTime(""); // Reset time when chair changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma cadeira" />
              </SelectTrigger>
              <SelectContent>
                {activeChairs.map((chair) => (
                  <SelectItem key={chair.id} value={chair.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{chair.name}</span>
                      {chair.location && (
                        <span className="text-sm text-gray-500">
                          {chair.location}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <div className="relative">
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime(""); // Reset time when date changes
                }}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Time Selection */}
          {selectedChairId && selectedDate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Horário Disponível
              </Label>

              {availableTimesLoading ? (
                <div className="flex items-center gap-2 p-4 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Carregando horários...
                </div>
              ) : availableTimes?.times.length ? (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {availableTimes.times.map((timeSlot) => (
                    <button
                      key={timeSlot.time}
                      onClick={() =>
                        timeSlot.available && setSelectedTime(timeSlot.time)
                      }
                      disabled={!timeSlot.available}
                      className={`p-2 text-sm rounded-md border transition-colors ${
                        selectedTime === timeSlot.time
                          ? "bg-blue-600 text-white border-blue-600"
                          : timeSlot.available
                          ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                      title={!timeSlot.available ? timeSlot.reason : undefined}
                    >
                      {timeSlot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center border border-gray-200 rounded-md">
                  Nenhum horário disponível para esta data
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={createLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || createLoading}
              className="flex-1"
            >
              {createLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Agendando...
                </div>
              ) : (
                "Confirmar Agendamento"
              )}
            </Button>
          </div>

          {/* Info Section */}
          <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            <p className="font-medium mb-1">Informações importantes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Cada sessão de massagem tem duração de 30 minutos</li>
              <li>Você pode ter apenas um agendamento ativo por vez</li>
              <li>
                Cancelamentos devem ser feitos com pelo menos 3 horas de
                antecedência
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
