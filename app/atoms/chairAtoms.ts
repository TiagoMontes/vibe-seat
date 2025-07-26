import { atom } from "jotai";
import { Chair, Pagination, ChairFilters, ChairInsights } from "@/app/types/api";

// ===== ESTADOS PRINCIPAIS =====

// Lista de cadeiras (agora paginada)
export const chairsAtom = atom<Chair[]>([]);

// Informações de paginação
export const paginationAtom = atom<Pagination>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 9,
  hasNextPage: false,
  hasPrevPage: false,
  nextPage: null,
  prevPage: null,
  lastPage: 1,
});

// Filtros ativos
export const chairFiltersAtom = atom<ChairFilters>({
  page: 1,
  limit: 6,
  search: "",
  status: "all",
  sortBy: "newest",
});

// Insights das cadeiras
export const chairsInsightsAtom = atom<ChairInsights>({
  total: 0,
  active: 0,
  maintenance: 0,
  inactive: 0,
});

// ===== ESTADOS DE LOADING =====
export const chairsLoadingAtom = atom<boolean>(false);
export const chairCreateLoadingAtom = atom<boolean>(false);
export const chairUpdateLoadingAtom = atom<boolean>(false);
export const chairDeleteLoadingAtom = atom<boolean>(false);

// ===== ESTADOS DE MODAL =====
export const chairModalOpenAtom = atom<boolean>(false);
export const chairEditModalOpenAtom = atom<boolean>(false);
export const selectedChairAtom = atom<Chair | null>(null);

// ===== ATOMS DERIVADOS =====

// Estado combinado de loading (qualquer operação)
export const isAnyChairLoadingAtom = atom((get) => {
  return get(chairsLoadingAtom) || 
         get(chairCreateLoadingAtom) || 
         get(chairUpdateLoadingAtom) || 
         get(chairDeleteLoadingAtom);
});

// Cadeiras filtradas por status (para estatísticas)
export const activeChairsAtom = atom((get) => {
  const chairs = get(chairsAtom);
  return chairs.filter(chair => chair.status === "ACTIVE");
});

export const maintenanceChairsAtom = atom((get) => {
  const chairs = get(chairsAtom);
  return chairs.filter(chair => chair.status === "MAINTENANCE");
});

export const inactiveChairsAtom = atom((get) => {
  const chairs = get(chairsAtom);
  return chairs.filter(chair => chair.status === "INACTIVE");
});

// ===== ATOMS PARA OPERAÇÕES =====

// Trigger para forçar atualizações
export const chairsUpdateTriggerAtom = atom<number>(0);

// Função para incrementar o trigger
export const incrementChairsUpdateTriggerAtom = atom(
  null,
  (get, set) => {
    const current = get(chairsUpdateTriggerAtom);
    set(chairsUpdateTriggerAtom, current + 1);
  }
);