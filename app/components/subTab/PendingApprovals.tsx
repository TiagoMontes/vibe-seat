"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Users,
  Check,
  X,
  Clock,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { type Approval } from "@/app/atoms/userManagementAtoms";
import { formatDateTime, getRoleByName } from "@/app/lib/utils";
import { useApprovals } from "@/app/hooks/useApprovals";
import { PaginationComponent } from "@/app/components/PaginationComponent";
import GenericFilter from "@/app/components/GenericFilter";
import EmptyState from "@/app/components/EmptyState";
import { useEffect } from "react";

const sortOptions = [
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigas" },
  { value: "user-asc", label: "Usuário (A-Z)" },
  { value: "user-desc", label: "Usuário (Z-A)" },
];

const PendingApprovals: React.FC = () => {
  const {
    listApprovals,
    updateApproval,
    setFilters,
    approvals,
    pagination,
    stats,
    filters,
    loading,
  } = useApprovals();

  useEffect(() => {
    listApprovals(filters);
  }, [filters, listApprovals]);

  const handleApproval = async (
    approvalId: number,
    status: "approved" | "rejected"
  ) => {
    await updateApproval(approvalId, { status });
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const handleSortChange = (value: string) => {
    setFilters({ ...filters, sortBy: value as any });
  };

  const handleClearFilters = () => {
    setFilters({ ...filters, search: "", status: "pending", sortBy: "newest" });
  };

  const goToPage = (page: number) => {
    setFilters({ ...filters, page });
    listApprovals(filters);
  };

  const hasActiveFilters =
    (filters.search && filters.search.trim() !== "") ||
    filters.status !== "pending" ||
    filters.sortBy !== "newest";

  const ApprovalComponent = (approval: Approval) => {
    const { date, time } = formatDateTime(approval.createdAt);

    return (
      <div
        key={approval.id}
        className="h-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex flex-col"
      >
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-orange-600" />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            {/* Username and Status */}
            <div className="flex items-center gap-2 mb-2">
              <h3
                className="text-base font-semibold text-gray-900 truncate"
                title={approval.user.username}
              >
                {approval.user.username}
              </h3>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium shrink-0">
                Pendente
              </span>
            </div>

            {/* Role */}
            <p className="font-semibold text-blue-600 mb-2">
              {getRoleByName(approval.requestedRole.name)}
            </p>

            {/* Metadata */}
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {date}, {time}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 shrink-0" />
                <span>ID: {approval.user.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4 shrink-0">
          <Button
            onClick={() => handleApproval(approval.id, "rejected")}
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4" />
            Rejeitar
          </Button>
          <Button
            onClick={() => handleApproval(approval.id, "approved")}
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            size="sm"
          >
            <Check className="h-4 w-4" />
            Aprovar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between lg:justify-start lg:gap-4">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-orange-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Aprovações Pendentes
            </h2>
          </div>
        </div>
        {stats.pending > 0 && (
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {stats.pending}
          </div>
        )}
      </div>

      {/* Filtro Genérico */}
      <GenericFilter
        searchPlaceholder="Buscar por usuário ou role..."
        searchValue={filters.search || ""}
        onSearchChange={handleSearchChange}
        sortOptions={sortOptions}
        sortValue={filters.sortBy}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}

      {!loading && (
        <>
          <Card>
            <CardContent className="flex justify-center">
              {approvals.length === 0 ? (
                <EmptyState
                  icon={<AlertTriangle className="h-16 w-16 text-gray-300" />}
                  title="Nenhuma aprovação pendente encontrada"
                  description={
                    hasActiveFilters
                      ? "Nenhuma aprovação pendente corresponde aos filtros aplicados."
                      : "Ainda não há aprovações pendentes."
                  }
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4">
                  {approvals.map((approval) =>
                    ApprovalComponent(approval as unknown as Approval)
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <PaginationComponent
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              currentPage={pagination.currentPage}
              nextPage={pagination.nextPage || 0}
              prevPage={pagination.prevPage || 0}
              lastPage={pagination.lastPage}
              goToPage={(_, page) => goToPage(page)}
              selectedDate=""
            />
          )}
        </>
      )}
    </div>
  );
};

export default PendingApprovals;
