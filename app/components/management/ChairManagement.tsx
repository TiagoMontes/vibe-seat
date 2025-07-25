"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
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
  AlertTriangle,
} from "lucide-react";
import { useChairs } from "@/app/hooks/useChairs";
import {
  chairModalOpenAtom,
  chairEditModalOpenAtom,
  selectedChairAtom,
  computedChairStatsAtom,
} from "@/app/atoms/chairAtoms";
import {
  ChairStatusKey,
  getStatusLabel,
  getStatusColor,
  getStatusOptions,
} from "@/app/schemas/chairSchema";
import ChairModal from "@/app/components/modal/ChairModal";
import GenericFilter from "@/app/components/GenericFilter";
import { PaginationComponent } from "@/app/components/PaginationComponent";
import EmptyState from "@/app/components/EmptyState";
import { Chair } from "@/app/types/api";

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";
type StatusFilter = "all" | "ACTIVE" | "MAINTENANCE" | "INACTIVE";

const ChairManagement = () => {
  const [, setIsCreateModalOpen] = useAtom(chairModalOpenAtom);
  const [, setIsEditModalOpen] = useAtom(chairEditModalOpenAtom);
  const [, setSelectedChair] = useAtom(selectedChairAtom);
  const [chairStats] = useAtom(computedChairStatsAtom);

  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("all");
  const [sortInput, setSortInput] = useState<SortOption>("newest");

  const {
    fetchChairs,
    createChair,
    deleteChair,
    setFilters,
    chairs,
    pagination,
    filters,
    loading,
  } = useChairs();

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isSearchPending, setIsSearchPending] = useState(false);

  useEffect(() => {
    fetchChairs(filters);
  }, [fetchChairs, filters]);

  useEffect(() => {
    setSearchInput(filters.search || "");
    setStatusInput(filters.status || "all");
    setSortInput(filters.sortBy || "newest");
  }, [filters]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleStatusChange = useCallback(
    (value: StatusFilter) => {
      setStatusInput(value);
      setFilters({ ...filters, status: value, page: 1 });
    },
    [setFilters]
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearchPending(true);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      setFilters({ ...filters, search: value, page: 1 });
      setIsSearchPending(false);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const handleSortChange = (value: string) => {
    setSortInput(value as SortOption);
    setFilters({ ...filters, sortBy: value as SortOption, page: 1 });
  };

  const handleClearFilters = () => {
    // Clear timeout if exists
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchInput("");
    setStatusInput("all");
    setSortInput("newest");
    setIsSearchPending(false);
    setFilters({
      page: 1,
      limit: 9,
      search: "",
      status: "all",
      sortBy: "newest",
    });
  };

  const goToPage = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleEditChair = (chair: Chair) => {
    setSelectedChair(chair);
    setIsEditModalOpen(true);
  };

  const handleDeleteChair = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta cadeira?")) {
      try {
        await deleteChair(id);
        // Toast já é gerenciado pelo hook useChairs
      } catch (err) {
        // Toast já é gerenciado pelo hook useChairs
        console.error(err);
      }
    }
  };

  const getStatusColorClass = (status: string) => {
    const colorName = getStatusColor(status as ChairStatusKey);
    switch (colorName) {
      case "green":
        return "bg-green-100 text-green-800";
      case "yellow":
        return "bg-yellow-100 text-yellow-800";
      case "red":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    return getStatusLabel(status as ChairStatusKey);
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

  const hasActiveFilters =
    searchInput || statusInput !== "all" || sortInput !== "newest";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col lg:flex-row gap-4">
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
          className="flex w-full lg:w-auto items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Cadeira
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[
          {
            key: "total",
            label: "Total",
            value: chairStats.total,
            icon: Armchair,
            valueColor: "text-black",
            iconColor: "text-gray-400",
          },
          {
            key: "active",
            label: getStatusLabel("ACTIVE"),
            value: chairStats.active,
            icon: Activity,
            valueColor: "text-green-600",
            iconColor: "text-green-400",
          },
          {
            key: "maintenance",
            label: getStatusLabel("MAINTENANCE"),
            value: chairStats.maintenance,
            icon: Wrench,
            valueColor: "text-yellow-600",
            iconColor: "text-yellow-400",
          },
          {
            key: "inactive",
            label: getStatusLabel("INACTIVE"),
            value: chairStats.inactive,
            icon: XCircle,
            valueColor: "text-red-600",
            iconColor: "text-red-400",
          },
        ].map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.key} className="flex-1 border border-gray-200">
              <CardContent className="p-4 h-[100px] flex items-center">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col justify-center min-h-[52px]">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <div className="w-16 h-8 flex items-center">
                      <p
                        className={`text-2xl font-bold ${stat.valueColor} tabular-nums leading-none`}
                      >
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <IconComponent className={`h-8 w-8 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <GenericFilter
        searchPlaceholder="Pesquisar por nome, descrição ou localização..."
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        isSearchPending={isSearchPending}
        statusOptions={[
          { value: "all", label: "Todos" },
          ...getStatusOptions().map((option) => ({
            value: option.value,
            label: option.label,
          })),
        ]}
        statusValue={statusInput}
        onStatusChange={(value) => handleStatusChange(value as StatusFilter)}
        sortOptions={[
          { value: "newest", label: "Mais recentes" },
          { value: "oldest", label: "Mais antigas" },
          { value: "name-asc", label: "Nome (A-Z)" },
          { value: "name-desc", label: "Nome (Z-A)" },
        ]}
        sortValue={sortInput}
        onSortChange={(value) => handleSortChange(value as SortOption)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={!!hasActiveFilters}
      />

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold text-black mb-4">
            Lista de Cadeiras
          </h2>

          {chairs.length === 0 && !loading ? (
            <EmptyState
              icon={<AlertTriangle className="h-16 w-16 text-gray-300" />}
              title="Nenhuma cadeira encontrada"
              description={
                hasActiveFilters
                  ? "Nenhuma cadeira corresponde aos filtros aplicados."
                  : "Ainda não há cadeiras cadastradas no sistema."
              }
              hasActiveFilters={!!hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {chairs.map((chair) => (
                  <Card
                    key={chair.id}
                    className="border border-gray-200 transition-opacity duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Armchair className="h-5 w-5 text-gray-600" />
                          <h3 className="font-semibold text-black">
                            {chair.name}
                          </h3>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(
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
              <PaginationComponent
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                currentPage={pagination.currentPage}
                nextPage={pagination.nextPage || 0}
                prevPage={pagination.prevPage || 0}
                lastPage={pagination.totalPages}
                goToPage={(_, page: number) => goToPage(page)}
                selectedDate=""
              />
            </>
          )}
        </CardContent>
      </Card>

      <ChairModal />
    </div>
  );
};

export default ChairManagement;
