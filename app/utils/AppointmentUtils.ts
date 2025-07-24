export const getStatusColor = (status: string) => {
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

export const getStatusLabel = (status: string) => {
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

export const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("pt-BR"),
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };