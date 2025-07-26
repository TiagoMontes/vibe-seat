import * as yup from "yup";
import { z } from "zod";
import { CreateUserRequest } from "@/app/types/api";

export const registerSchema = yup.object({
  username: yup
    .string()
    .required("Usuário é obrigatório")
    .min(3, "Usuário deve ter pelo menos 3 caracteres")
    .max(50, "Usuário deve ter no máximo 50 caracteres")
    .matches(
      /^[a-zA-Z0-9._-]+$/,
      "Usuário deve conter apenas letras, números, pontos, hífens ou underscores"
    ),
  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  confirmPassword: yup
    .string()
    .required("Confirmação de senha é obrigatória")
    .oneOf([yup.ref("password")], "Senhas devem ser iguais"),
  roleId: yup
    .number()
    .required("Tipo de usuário é obrigatório")
    .min(1, "Tipo de usuário inválido"),
});

export const registerZodSchema = z.object({
  username: z
    .string()
    .min(1, "Usuário é obrigatório")
    .min(3, "Usuário deve ter pelo menos 3 caracteres")
    .max(50, "Usuário deve ter no máximo 50 caracteres")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Usuário deve conter apenas letras, números, pontos, hífens ou underscores"
    ),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  confirmPassword: z
    .string()
    .min(1, "Confirmação de senha é obrigatória"),
  roleId: z
    .number()
    .min(1, "Tipo de usuário inválido"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas devem ser iguais",
  path: ["confirmPassword"],
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type RegisterZodFormData = z.infer<typeof registerZodSchema>;

// Type guard para verificar se os dados são do tipo CreateUserRequest
export const isCreateUserRequest = (data: unknown): data is CreateUserRequest => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as CreateUserRequest).username === 'string' &&
    typeof (data as CreateUserRequest).password === 'string' &&
    typeof (data as CreateUserRequest).roleId === 'number'
  );
};

// Helper para converter RegisterFormData para CreateUserRequest
export const toCreateUserRequest = (data: RegisterFormData): CreateUserRequest => {
  return {
    username: data.username,
    password: data.password,
    roleId: data.roleId,
  };
}; 