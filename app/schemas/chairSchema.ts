import * as yup from "yup";

export type ChairStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

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
  status: ChairStatus;
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