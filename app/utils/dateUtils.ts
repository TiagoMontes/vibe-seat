/**
 * Utilitários para tratamento consistente de datas em toda a aplicação
 * Evita problemas de fuso horário mantendo sempre o horário local
 */

/**
 * Converte uma data para string no formato YYYY-MM-DD (sem conversão de timezone)
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Converte data + horário (HH:MM) para string ISO local
 * Mantém o horário local sem conversão para UTC
 */
export const formatDateTimeToLocalISO = (date: Date, time: string): string => {
  const [hours, minutes] = time.split(':');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedHours = String(parseInt(hours)).padStart(2, '0');
  const formattedMinutes = String(parseInt(minutes)).padStart(2, '0');
  
  return `${year}-${month}-${day}T${formattedHours}:${formattedMinutes}:00.000Z`;
};

/**
 * Converte string de data (YYYY-MM-DD) para ISO local com horário específico
 */
export const formatDateStringToLocalISO = (dateString: string, time: string = '00:00'): string => {
  const [hours, minutes] = time.split(':');
  const formattedHours = String(parseInt(hours)).padStart(2, '0');
  const formattedMinutes = String(parseInt(minutes)).padStart(2, '0');
  
  return `${dateString}T${formattedHours}:${formattedMinutes}:00.000Z`;
};

/**
 * Converte string de data para ISO local com horário de início do dia
 */
export const formatDateStringToStartOfDay = (dateString: string): string => {
  return `${dateString}T00:00:00.000Z`;
};

/**
 * Converte string de data para ISO local com horário de fim do dia
 */
export const formatDateStringToEndOfDay = (dateString: string): string => {
  return `${dateString}T23:59:59.999Z`;
};

/**
 * Extrai apenas a parte da data (YYYY-MM-DD) de uma string ISO
 */
export const extractDateFromISO = (isoString: string): string => {
  return isoString.split('T')[0];
};

/**
 * Extrai apenas a parte do horário (HH:MM) de uma string ISO
 */
export const extractTimeFromISO = (isoString: string): string => {
  const timePart = isoString.split('T')[1];
  return timePart.substring(0, 5); // HH:MM
};

/**
 * Converte Date para string local no formato brasileiro (dd/mm/aaaa)
 */
export const formatDateToBR = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Verifica se uma data está no passado (comparação apenas de data, ignorando horário)
 */
export const isDateInPast = (date: Date): boolean => {
  const today = new Date();
  const compareDate = new Date(date);
  
  // Zerar horários para comparar apenas as datas
  today.setHours(0, 0, 0, 0);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
};

/**
 * Verifica se uma data é hoje
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  const compareDate = new Date(date);
  
  return today.getFullYear() === compareDate.getFullYear() &&
         today.getMonth() === compareDate.getMonth() &&
         today.getDate() === compareDate.getDate();
};

/**
 * Utility para tratar string de data/hora como horário local
 * Remove a conversão automática de UTC para local
 */
export const parseAsLocalTimeComponents = (dateTimeString: string): Date => {
  if (dateTimeString.includes("Z")) {
    // Extrai os componentes da string UTC
    const cleanString = dateTimeString.replace("Z", "").replace("T", " ");
    const [datePart, timePart] = cleanString.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    
    // Cria a data como local (sem conversão de fuso)
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
  const dateStr = dateTimeString.replace("T", " ");
  return new Date(dateStr);
};

/**
 * Formata data e hora para exibição em português
 */
export const formatDateTime = (dateTimeString: string) => {
  const date = parseAsLocalTimeComponents(dateTimeString);
  return {
    date: date.toLocaleDateString("pt-BR"),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

/**
 * Formata um range de data/hora (início e fim)
 */
export const formatDateTimeRange = (
  datetimeStart: string,
  datetimeEnd: string
) => {
  const startDate = parseAsLocalTimeComponents(datetimeStart);
  const endDate = parseAsLocalTimeComponents(datetimeEnd);

  return {
    date: startDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    timeRange: `${startDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    startTime: startDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    endTime: endDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

/**
 * Formata timestamp de criação
 */
export const formatCreatedAt = (createdAt: string) => {
  const date = parseAsLocalTimeComponents(createdAt);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Verifica se um agendamento está no passado
 */
export const isAppointmentPast = (datetime: string): boolean => {
  const appointmentDate = parseAsLocalTimeComponents(datetime);
  const now = new Date();
  return appointmentDate < now;
};

/**
 * Verifica se um agendamento pode ser cancelado (3+ horas antes)
 */
export const canCancelAppointment = (appointment: {
  datetimeStart: string;
  status: string;
}): boolean => {
  const appointmentDate = parseAsLocalTimeComponents(appointment.datetimeStart);
  const now = new Date();
  const hoursDiff =
    (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return appointment.status === "SCHEDULED" && hoursDiff >= 3;
};