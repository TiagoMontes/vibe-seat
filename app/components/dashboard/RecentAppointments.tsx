import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Clock, MapPin, User } from "lucide-react";
import {
  getStatusLabel,
  getStatusVariant,
  formatDateTime,
} from "@/app/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/app/types/api";

interface RecentAppointmentsProps {
  appointments: Appointment[];
}

const RecentAppointmentsComponent: React.FC<RecentAppointmentsProps> = ({
  appointments,
}) => {
  const renderEmptyState = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Agendamentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Clock className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-sm">Nenhum agendamento recente</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderAppointmentCard = (appointment: Appointment) => {
    const { date, time } = formatDateTime(appointment.datetimeStart);

    return (
      <div
        key={appointment.id}
        className="flex flex-col justify-between gap-3 p-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900 truncate">
              {appointment.user?.username || "Usuário não identificado"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 truncate">
              {appointment.chair?.name || "Cadeira não especificada"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{date} às {time}</span>
          </div>
        </div>

        <div className="mt-2">
          <Badge variant={getStatusVariant(appointment.status) as "default" | "secondary" | "destructive" | "outline"}>
            {getStatusLabel(appointment.status)}
          </Badge>
        </div>
      </div>
    );
  };

  if (appointments.length === 0) {
    return renderEmptyState();
  }

  return (
    <Card className="h-full flex flex-col gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Agendamentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.slice(0, 6).map(renderAppointmentCard)}
        </div>
      </CardContent>
    </Card>
  );
};

RecentAppointmentsComponent.displayName = "RecentAppointments";

export const RecentAppointments = React.memo(RecentAppointmentsComponent);