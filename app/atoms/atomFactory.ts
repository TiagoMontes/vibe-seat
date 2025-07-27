import { atom } from 'jotai';
import { Pagination } from '@/app/types/api';

export interface BaseListAtoms<T, F> {
  // Data atoms
  itemsAtom: ReturnType<typeof atom<T[]>>;
  paginationAtom: ReturnType<typeof atom<Pagination>>;
  filtersAtom: ReturnType<typeof atom<F>>;
  
  // Loading atoms
  loadingAtom: ReturnType<typeof atom<boolean>>;
  createLoadingAtom: ReturnType<typeof atom<boolean>>;
  updateLoadingAtom: ReturnType<typeof atom<boolean>>;
  deleteLoadingAtom: ReturnType<typeof atom<boolean>>;
  
  // Error atoms
  errorAtom: ReturnType<typeof atom<string>>;
  successMessageAtom: ReturnType<typeof atom<string>>;
  
  // Modal/UI atoms
  modalOpenAtom: ReturnType<typeof atom<boolean>>;
  selectedItemAtom: ReturnType<typeof atom<T | null>>;
  
  // Insights/Stats (optional)
  insightsAtom?: ReturnType<typeof atom<unknown>>;
  
  // Update trigger
  updateTriggerAtom: ReturnType<typeof atom<number>>;
  incrementUpdateTriggerAtom: ReturnType<typeof atom<null, [], void>>;
}

export const createListAtoms = <T, F>(
  entityName: string,
  defaultFilters: F,
  defaultPagination: Pagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    lastPage: 1,
  }
): BaseListAtoms<T, F> => {
  // Data atoms
  const itemsAtom = atom<T[]>([]);
  const paginationAtom = atom<Pagination>(defaultPagination);
  const filtersAtom = atom<F>(defaultFilters);
  
  // Loading atoms
  const loadingAtom = atom<boolean>(false);
  const createLoadingAtom = atom<boolean>(false);
  const updateLoadingAtom = atom<boolean>(false);
  const deleteLoadingAtom = atom<boolean>(false);
  
  // Error/Success atoms
  const errorAtom = atom<string>('');
  const successMessageAtom = atom<string>('');
  
  // Modal/UI atoms
  const modalOpenAtom = atom<boolean>(false);
  const selectedItemAtom = atom<T | null>(null);
  
  // Update trigger for forcing re-renders
  const updateTriggerAtom = atom<number>(0);
  const incrementUpdateTriggerAtom = atom(
    null,
    (get, set) => {
      const current = get(updateTriggerAtom);
      set(updateTriggerAtom, current + 1);
    }
  );
  
  return {
    itemsAtom,
    paginationAtom,
    filtersAtom,
    loadingAtom,
    createLoadingAtom,
    updateLoadingAtom,
    deleteLoadingAtom,
    errorAtom,
    successMessageAtom,
    modalOpenAtom,
    selectedItemAtom,
    updateTriggerAtom,
    incrementUpdateTriggerAtom,
  };
};

// Factory para criar atoms com insights/stats
export const createListAtomsWithInsights = <T, F, I>(
  entityName: string,
  defaultFilters: F,
  defaultInsights: I,
  defaultPagination?: Pagination
) => {
  const baseAtoms = createListAtoms<T, F>(entityName, defaultFilters, defaultPagination);
  
  const insightsAtom = atom<I>(defaultInsights);
  
  return {
    ...baseAtoms,
    insightsAtom,
  };
};

// Factory específico para entidades com status
export const createStatusEntityAtoms = <T extends { status: string }, F>(
  entityName: string,
  defaultFilters: F,
  defaultPagination?: Pagination
) => {
  const baseAtoms = createListAtoms<T, F>(entityName, defaultFilters, defaultPagination);
  
  // Atoms derivados para status
  const activeItemsAtom = atom((get) => {
    const items = get(baseAtoms.itemsAtom);
    return items.filter(item => item.status === 'ACTIVE');
  });
  
  const inactiveItemsAtom = atom((get) => {
    const items = get(baseAtoms.itemsAtom);
    return items.filter(item => item.status === 'INACTIVE');
  });
  
  const totalActiveAtom = atom((get) => {
    const activeItems = get(activeItemsAtom);
    return activeItems.length;
  });
  
  return {
    ...baseAtoms,
    activeItemsAtom,
    inactiveItemsAtom,
    totalActiveAtom,
  };
};

// Tipos auxiliares para facilitar o uso
export type ListAtoms<T, F> = ReturnType<typeof createListAtoms<T, F>>;
export type ListAtomsWithInsights<T, F, I> = ReturnType<typeof createListAtomsWithInsights<T, F, I>>;
export type StatusEntityAtoms<T extends { status: string }, F> = ReturnType<typeof createStatusEntityAtoms<T, F>>;