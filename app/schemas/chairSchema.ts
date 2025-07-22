import * as yup from "yup";

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

export interface Chair {
  id: number;
  name: string;
  description?: string;
  location?: string;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface ChairStats {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ChairListResponse {
  chairs: Chair[];
  pagination: PaginationInfo;
  stats?: ChairStats; // Optional - backend may provide global stats
}

export interface ChairFilters {
  page: number;
  limit: number;
  search: string;
  status: "all" | "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  sortBy: "newest" | "oldest" | "name-asc" | "name-desc";
} 