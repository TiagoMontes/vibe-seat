import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { DashboardRecentAppointment } from "@/app/types/dashboard";
import { Clock, MapPin, User, Calendar } from "lucide-react";

interface RecentAppointmentsProps {
  appointments: DashboardRecentAppointment[];
}

export const RecentAppointments: React.FC<RecentAppointmentsProps> = React.memo(
  ({ appointments }) => {
    // Memoizar a formatação de data/hora
    const formatDateTime = React.useCallback((dateTimeString: string) => {
      const date = new Date(dateTimeString);
      return {
        date: date.toLocaleDateString("pt-BR"),
        time: date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }, []);

    const getStatusColor = (status: string) => {
      switch (status) {
        case "SCHEDULED":
          return "bg-blue-100 text-blue-800";
        case "CONFIRMED":
          return "bg-green-100 text-green-800";
        case "CANCELLED":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case "SCHEDULED":
          return "Agendado";
        case "CONFIRMED":
          return "Confirmado";
        case "CANCELLED":
          return "Cancelado";
        default:
          return status;
      }
    };

    if (appointments.length === 0) {
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Agendamentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum agendamento recente</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendamentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full justify-between gap-4">
            {appointments.slice(0, 5).map((appointment) => {
              const { date, time } = formatDateTime(appointment.datetimeStart);

              return (
                <div
                  key={appointment.id}
                  className="flex w-full items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >

                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {appointment.user.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 truncate">
                          {appointment.chair.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {date} às {time}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }
);
