"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import {
  Schedule,
  getDayShortLabel,
  isScheduleActive,
  calculateTimeSlots
} from "@/app/schemas/scheduleSchema";

interface ScheduleCalendarProps {
  schedules: Schedule[];
  onCreateSchedule: () => void;
  onEditSchedule: (schedule: Schedule) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  schedules,
  onCreateSchedule,
  onEditSchedule,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = useMemo(() => {
    const days = [];

    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i),
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day),
      });
    }

    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, day),
      });
    }

    return days;
  }, [year, month, firstDayWeekday, daysInMonth]);

  const getSchedulesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();

    return schedules.filter((schedule) => {
      if (schedule.dayOfWeek !== dayOfWeek) return false;

      const validFrom = schedule.validFrom
        ? new Date(schedule.validFrom)
        : null;
      const validTo = schedule.validTo ? new Date(schedule.validTo) : null;

      if (validFrom && date < validFrom) return false;
      if (validTo && date > validTo) return false;

      return true;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-black flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendário de Disponibilidade
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs"
            >
              Hoje
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-lg font-medium min-w-[200px] text-center">
              {monthNames[month]} {year}
            </span>

            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-medium text-gray-600 bg-gray-50 rounded"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((calendarDay, index) => {
            const daySchedules = getSchedulesForDate(calendarDay.fullDate);
            const totalSlots = daySchedules.reduce(
              (sum, schedule) =>
                sum + calculateTimeSlots(schedule.timeStart, schedule.timeEnd),
              0
            );

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg transition-colors ${
                  calendarDay.isCurrentMonth
                    ? "bg-white border-gray-200"
                    : "bg-gray-50 border-gray-100"
                } ${
                  isToday(calendarDay.fullDate) ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      calendarDay.isCurrentMonth
                        ? isToday(calendarDay.fullDate)
                          ? "text-blue-600 font-bold"
                          : "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {calendarDay.date}
                  </span>

                  {calendarDay.isCurrentMonth && daySchedules.length === 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onCreateSchedule}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {calendarDay.isCurrentMonth && daySchedules.length > 0 && (
                  <div className="space-y-1">
                    {daySchedules.slice(0, 2).map((schedule) => {
                      const isActive = isScheduleActive(schedule);
                      const slots = calculateTimeSlots(
                        schedule.timeStart,
                        schedule.timeEnd
                      );

                      return (
                        <div
                          key={schedule.id}
                          onClick={() => onEditSchedule(schedule)}
                          className={`p-1 rounded text-xs cursor-pointer transition-colors ${
                            isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {schedule.timeStart}-{schedule.timeEnd}
                            </span>
                            {isActive ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                          </div>
                          <div className="text-xs opacity-75">
                            {slots} slots
                          </div>
                        </div>
                      );
                    })}

                    {daySchedules.length > 2 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{daySchedules.length - 2} mais
                      </div>
                    )}

                    {totalSlots > 0 && (
                      <div className="text-xs text-center py-1 bg-blue-50 text-blue-700 rounded">
                        {totalSlots} slots total
                      </div>
                    )}
                  </div>
                )}

                {calendarDay.isCurrentMonth && daySchedules.length === 0 && (
                  <div className="text-xs text-gray-400 text-center mt-2">
                    {getDayShortLabel(calendarDay.fullDate.getDay())}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-gray-600">Ativo</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-gray-600">Inativo</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span className="text-gray-600">Sem configuração</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar;
