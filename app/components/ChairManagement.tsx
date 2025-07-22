"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Armchair,
  Plus,
  Edit,
  Trash2,
  Activity,
  Wrench,
  XCircle,
  MapPin,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Pagination, PaginationInfo } from "@/app/components/ui/pagination";
import { useChairs } from "@/app/hooks/useChairs";
import {
  chairModalOpenAtom,
  chairEditModalOpenAtom,
  selectedChairAtom,
  computedChairStatsAtom,
} from "@/app/atoms/chairAtoms";
import { Chair } from "@/app/schemas/chairSchema";
import ChairModal from "./ChairModal";

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";
type StatusFilter = "all" | "ACTIVE" | "MAINTENANCE" | "INACTIVE";

const ChairManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useAtom(chairModalOpenAtom);
  const [isEditModalOpen, setIsEditModalOpen] = useAtom(chairEditModalOpenAtom);
  const [selectedChair, setSelectedChair] = useAtom(selectedChairAtom);
  const [chairStats] = useAtom(computedChairStatsAtom);

  // Local state for form inputs (controlled components)
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("all");
  const [sortInput, setSortInput] = useState<SortOption>("newest");

  const {
    chairs,
    pagination,
    filters,
    loading,
    deleteLoading,
    fetchChairs,
    updateFilters,
    resetFilters,
    goToPage,
    nextPage,
    prevPage,
    deleteChair,
  } = useChairs();

  // Debounced search - wait 500ms after user stops typing
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Initialize data on mount
  useEffect(() => {
    fetchChairs();
  }, [fetchChairs]);

  // Sync local state with filters when they change
  useEffect(() => {
    setSearchInput(filters.search);
    setStatusInput(filters.status);
    setSortInput(filters.sortBy);
  }, [filters]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for debounced search
      const timeout = setTimeout(() => {
        updateFilters({ search: value });
      }, 500);

      setSearchTimeout(timeout);
    },
    [searchTimeout, updateFilters]
  );

  const handleStatusChange = useCallback(
    (value: StatusFilter) => {
      setStatusInput(value);
      updateFilters({ status: value });
    },
    [updateFilters]
  );

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSortInput(value);
      updateFilters({ sortBy: value });
    },
    [updateFilters]
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setStatusInput("all");
    setSortInput("newest");
    resetFilters();
  }, [resetFilters]);

  const handleEditChair = (chair: Chair) => {
    setSelectedChair(chair);
    setIsEditModalOpen(true);
  };

  const handleDeleteChair = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta cadeira?")) {
      try {
        await deleteChair(id);
      } catch (error) {
        alert("Erro ao excluir cadeira");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Ativa";
      case "MAINTENANCE":
        return "Manutenção";
      case "INACTIVE":
        return "Inativa";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Activity className="h-4 w-4" />;
      case "MAINTENANCE":
        return <Wrench className="h-4 w-4" />;
      case "INACTIVE":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSortText = (option: SortOption) => {
    switch (option) {
      case "newest":
        return "Mais recentes";
      case "oldest":
        return "Mais antigas";
      case "name-asc":
        return "Nome (A-Z)";
      case "name-desc":
        return "Nome (Z-A)";
      default:
        return "";
    }
  };

  const hasActiveFilters =
    searchInput || statusInput !== "all" || sortInput !== "newest";

  if (loading && pagination.currentPage === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Carregando cadeiras...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Armchair className="h-8 w-8 text-black" />
          <div>
            <h1 className="text-3xl font-bold text-black">
              Gerenciamento de Cadeiras
            </h1>
            <p className="text-gray-600">Gerencie suas cadeiras de massagem</p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Cadeira
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-black">
                  {chairStats.total}
                </p>
              </div>
              <Armchair className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {chairStats.active}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manutenção</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {chairStats.maintenance}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inativas</p>
                <p className="text-2xl font-bold text-red-600">
                  {chairStats.inactive}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por nome, descrição ou localização..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select
                value={statusInput}
                onValueChange={(value) =>
                  handleStatusChange(value as StatusFilter)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Ativas</SelectItem>
                  <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
                  <SelectItem value="INACTIVE">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-600" />
              <Select
                value={sortInput}
                onValueChange={(value) => handleSortChange(value as SortOption)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigas</SelectItem>
                  <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="whitespace-nowrap"
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Results Info */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-600">
            <div>
              <PaginationInfo
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
              />
              {searchInput && ` • Pesquisando: "${searchInput}"`}
              {statusInput !== "all" &&
                ` • Status: ${getStatusText(statusInput)}`}
            </div>
            <span>Ordenado por: {getSortText(sortInput)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Chairs List */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Lista de Cadeiras
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : chairs.length === 0 ? (
            <div className="text-center py-8">
              <Armchair className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              {pagination.totalItems === 0 ? (
                <>
                  <p className="text-gray-500">Nenhuma cadeira cadastrada</p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar primeira cadeira
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-500">
                    Nenhuma cadeira encontrada com os filtros aplicados
                  </p>
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="mt-4"
                  >
                    Limpar Filtros
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {chairs.map((chair) => (
                  <Card key={chair.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Armchair className="h-5 w-5 text-gray-600" />
                          <h3 className="font-semibold text-black">
                            {chair.name}
                          </h3>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            chair.status
                          )}`}
                        >
                          {getStatusIcon(chair.status)}
                          {getStatusText(chair.status)}
                        </span>
                      </div>

                      {chair.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {chair.description}
                        </p>
                      )}

                      {chair.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                          <MapPin className="h-4 w-4" />
                          {chair.location}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mb-3">
                        Criada em:{" "}
                        {new Date(chair.createdAt).toLocaleDateString("pt-BR")}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEditChair(chair)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Button>

                        <Button
                          onClick={() => handleDeleteChair(chair.id)}
                          size="sm"
                          variant="destructive"
                          disabled={deleteLoading}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={goToPage}
                onNextPage={nextPage}
                onPrevPage={prevPage}
                className="mt-6"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Chair Modal */}
      <ChairModal />
    </div>
  );
};

export default ChairManagement;
