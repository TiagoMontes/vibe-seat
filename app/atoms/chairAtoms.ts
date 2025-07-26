import { atom } from "jotai";
import { Chair, Pagination, ChairFilters } from "@/app/types/api";

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
  status: "ACTIVE",
  sortBy: "newest",
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