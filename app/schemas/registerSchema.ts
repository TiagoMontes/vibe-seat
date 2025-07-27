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

// CPF validation helper
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, "");
  if (cleanCPF.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return parseInt(cleanCPF.charAt(9)) === digit1 && parseInt(cleanCPF.charAt(10)) === digit2;
};

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
  
  // RF02 - Campos obrigatórios
  fullName: z
    .string()
    .min(1, "Nome completo é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
    .refine(validateCPF, "CPF inválido"),
  jobFunction: z
    .string()
    .min(1, "Função é obrigatória")
    .max(100, "Função deve ter no máximo 100 caracteres"),
  position: z
    .string()
    .min(1, "Cargo é obrigatório")
    .max(100, "Cargo deve ter no máximo 100 caracteres"),
  registration: z
    .string()
    .min(1, "Matrícula é obrigatória")
    .max(50, "Matrícula deve ter no máximo 50 caracteres"),
  sector: z
    .string()
    .min(1, "Setor é obrigatório")
    .max(100, "Setor deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .max(100, "E-mail deve ter no máximo 100 caracteres"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX"),
  gender: z
    .enum(["M", "F", "Outro"])
    .refine(val => ["M", "F", "Outro"].includes(val), "Selecione um gênero válido"),
  birthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
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

// Helper para converter RegisterZodFormData para CreateUserRequest
export const toCreateUserRequest = (data: RegisterZodFormData): CreateUserRequest => {
  return {
    username: data.username,
    password: data.password,
    roleId: data.roleId,
    fullName: data.fullName,
    cpf: data.cpf,
    jobFunction: data.jobFunction,
    position: data.position,
    registration: data.registration,
    sector: data.sector,
    email: data.email,
    phone: data.phone,
    gender: data.gender,
    birthDate: data.birthDate,
  };
}; 