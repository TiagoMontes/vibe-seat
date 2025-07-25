import * as yup from "yup";
import { LoginRequest } from "@/app/types/api";

export const loginSchema = yup.object({
  username: yup
    .string()
    .required("Usuário é obrigatório")
    .min(3, "Usuário deve ter pelo menos 3 caracteres"),
  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

// Type guard para verificar se os dados são do tipo LoginRequest
export const isLoginRequest = (data: unknown): data is LoginRequest => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as LoginRequest).username === 'string' &&
    typeof (data as LoginRequest).password === 'string'
  );
}; 