import { atom } from "jotai";
import { Chair, ChairStats, PaginationInfo, ChairFilters } from "@/app/schemas/chairSchema";

// Lista de cadeiras (agora paginada)
export const chairsAtom = atom<Chair[]>([]);

// Informações de paginação
export const paginationAtom = atom<PaginationInfo>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 9,
  hasNextPage: false,
  hasPrevPage: false,
});

// Filtros ativos
export const chairFiltersAtom = atom<ChairFilters>({
  page: 1,
  limit: 6,
  search: "",
  status: "all",
  sortBy: "newest",
});

// Estatísticas das cadeiras (agora vem do backend)
export const chairStatsAtom = atom<ChairStats>({
  total: 0,
  active: 0,
  maintenance: 0,
  inactive: 0,
});

// Estados de loading
export const chairsLoadingAtom = atom<boolean>(false);
export const chairCreateLoadingAtom = atom<boolean>(false);
export const chairUpdateLoadingAtom = atom<boolean>(false);
export const chairDeleteLoadingAtom = atom<boolean>(false);

// Modal states
export const chairModalOpenAtom = atom<boolean>(false);
export const chairEditModalOpenAtom = atom<boolean>(false);
export const selectedChairAtom = atom<Chair | null>(null);

// Átomo derivado para calcular as estatísticas automaticamente (fallback para client-side)
export const computedChairStatsAtom = atom((get) => {
  const backendStats = get(chairStatsAtom);
  const chairs = get(chairsAtom);
  
  // Se temos stats do backend, usa elas
  if (backendStats.total > 0) {
    return backendStats;
  }
  
  // Fallback para cálculo client-side (quando não há paginação)
  const stats: ChairStats = {
    total: chairs.length,
    active: chairs.filter((chair) => chair.status === "ACTIVE").length,
    maintenance: chairs.filter((chair) => chair.status === "MAINTENANCE").length,
    inactive: chairs.filter((chair) => chair.status === "INACTIVE").length,
  };
  
  return stats;
}); 