import { useCallback } from "react";
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
  const showToast = useCallback((
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
  }, []);

  // Métodos específicos para cada tipo
  const success = useCallback((message: string, options?: ToastOptions) => {
    showToast("success", message, options);
  }, [showToast]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    showToast("error", message, options);
  }, [showToast]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    showToast("warning", message, options);
  }, [showToast]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    showToast("info", message, options);
  }, [showToast]);

  // Método para mostrar toasts de agendamento
  const appointmentSuccess = useCallback((message: string) => {
    success(message, {
      autoClose: 4000,
      toastId: "appointment-success",
    });
  }, [success]);

  const appointmentError = useCallback((message: string) => {
    error(message, {
      autoClose: 6000,
      toastId: "appointment-error",
    });
  }, [error]);

  // Método para limpar toasts específicos
  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

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
