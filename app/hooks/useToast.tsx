import { toast, ToastOptions } from "react-toastify";

// Configurações padrão para os toasts
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Tipos de toast disponíveis
export type ToastType = "success" | "error" | "warning" | "info";

// Hook personalizado para gerenciar toasts
export const useToast = () => {
  const showToast = (
    type: ToastType,
    message: string,
    options?: ToastOptions
  ) => {
    const toastOptions = { ...defaultOptions, ...options };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;

      case "error":
        toast.error(message, toastOptions);
        break;

      case "warning":
        toast.warning(message, toastOptions);
        break;

      case "info":
        toast.info(message, toastOptions);
        break;
    }
  };

  // Métodos específicos para cada tipo
  const success = (message: string, options?: ToastOptions) => {
    showToast("success", message, options);
  };

  const error = (message: string, options?: ToastOptions) => {
    showToast("error", message, options);
  };

  const warning = (message: string, options?: ToastOptions) => {
    showToast("warning", message, options);
  };

  const info = (message: string, options?: ToastOptions) => {
    showToast("info", message, options);
  };

  // Método para mostrar toasts de agendamento
  const appointmentSuccess = (message: string) => {
    success(message, {
      autoClose: 4000,
      toastId: "appointment-success",
    });
  };

  const appointmentError = (message: string) => {
    error(message, {
      autoClose: 6000,
      toastId: "appointment-error",
    });
  };

  // Método para limpar toasts específicos
  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  return {
    showToast,
    success,
    error,
    warning,
    info,
    appointmentSuccess,
    appointmentError,
    dismiss,
  };
};
