import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { DashboardRecentAppointment } from "@/app/types/dashboard";
import { Clock, MapPin, User } from "lucide-react";
import {
  getStatusColor,
  getStatusLabel,
  formatDateTime,
} from "@/app/lib/utils";

interface RecentAppointmentsProps {
  appointments: DashboardRecentAppointment[];
}

const RecentAppointmentsComponent: React.FC<RecentAppointmentsProps> = ({
  appointments,
}) => {
  if (appointments.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
          Agendamentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.slice(0, 6).map((appointment) => {
            const { date, time } = formatDateTime(appointment.datetimeStart);

            return (
              <div
                key={appointment.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center flex-wrap justify-between gap-2 w-full">
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
};

RecentAppointmentsComponent.displayName = "RecentAppointments";

export const RecentAppointments = React.memo(RecentAppointmentsComponent);
