import * as yup from "yup";
import { ChairStatus } from "@/app/types/api";

export const chairSchema = yup.object({
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: yup
    .string()
    .nullable()
    .max(500, "Descrição deve ter no máximo 500 caracteres"),
  location: yup
    .string()
    .nullable()
    .max(100, "Localização deve ter no máximo 100 caracteres"),
  status: yup
    .string()
    .oneOf(["ACTIVE", "MAINTENANCE", "INACTIVE"], "Status inválido")
    .required("Status é obrigatório"),
});

export const chairUpdateSchema = yup.object({
  name: yup
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: yup
    .string()
    .nullable()
    .max(500, "Descrição deve ter no máximo 500 caracteres"),
  location: yup
    .string()
    .nullable()
    .max(100, "Localização deve ter no máximo 100 caracteres"),
  status: yup
    .string()
    .oneOf(["ACTIVE", "MAINTENANCE", "INACTIVE"], "Status inválido"),
});

export type ChairFormData = yup.InferType<typeof chairSchema>;
export type ChairUpdateFormData = yup.InferType<typeof chairUpdateSchema>;

// Status mapping system
export const ChairStatusMap = {
  ACTIVE: {
    value: "ACTIVE",
    label: "Ativa",
    color: "green",
  },
  MAINTENANCE: {
    value: "MAINTENANCE", 
    label: "Manutenção",
    color: "yellow",
  },
  INACTIVE: {
    value: "INACTIVE",
    label: "Inativa", 
    color: "red",
  },
} as const;

export type ChairStatusKey = ChairStatus;

// Helper functions
export const getStatusLabel = (status: ChairStatusKey): string => {
  return ChairStatusMap[status]?.label || status;
};

export const getStatusColor = (status: ChairStatusKey): string => {
  return ChairStatusMap[status]?.color || "gray";
};

export const getStatusOptions = () => {
  return Object.values(ChairStatusMap).map(status => ({
    value: status.value,
    label: status.label,
  }));
}; 