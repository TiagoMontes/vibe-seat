"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import { Users, Search, Check, X, Clock, Calendar } from "lucide-react";
import { type Approval } from "@/app/atoms/userManagementAtoms";
import { formatDateTime, getRoleByName } from "@/app/lib/utils";
import { useApprovals } from "../hooks/useApprovals";
import { PaginationComponent } from "./PaginationComponent";

const PendingApprovals = () => {
  const {
    approvals,
    pagination,
    stats,
    filters,
    updateApprovalStatus,
    updateSearch,
    goToPage,
  } = useApprovals();

  const handleApproval = async (
    approvalId: number,
    status: "approved" | "rejected"
  ) => {
    await updateApprovalStatus(approvalId, status);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearch(e.target.value);
  };

  const ApprovalComponent = (approval: Approval) => {
    const { date, time } = formatDateTime(approval.createdAt);

    return (
      <div
        key={approval.id}
        className="p-4 border w-full flex-1 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col flex-wrap justify-between gap-4">
          {/* User Info */}
          <div className="flex items-start gap-4 ">
            <div className="min-w-12 min-h-12 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <h3
                  className="text-base font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-[200px]"
                  title={approval.user.username}
                >
                  {approval.user.username}
                </h3>
                <span className="mt-1 sm:mt-0 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium w-max">
                  Pendente
                </span>
              </div>

              <p className="font-semibold text-blue-600">
                {getRoleByName(approval.requestedRole.name)}
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-500 ">
                <p>
                  {date}, {time}
                </p>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>ID: {approval.user.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 lg:gap-3 shrink-0">
            <Button
              onClick={() => handleApproval(approval.id, "rejected")}
              variant="destructive"
              size="sm"
              className="w-full lg:w-auto"
            >
              <X className="h-4 w-4" />
              Rejeitar
            </Button>
            <Button
              onClick={() => handleApproval(approval.id, "approved")}
              className="bg-green-600 hover:bg-green-700 text-white w-full lg:w-auto"
              size="sm"
            >
              <Check className="h-4 w-4" />
              Aprovar
            </Button>
          </div>
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

      <Card>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por usuário ou role..."
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex justify-center">
          {approvals.length === 0 ? (
            <div className="text-center flex flex-col gap-2">
              <Clock className="h-16 w-16 text-gray-300 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">
                Nenhuma aprovação pendente
              </h3>
              <p className="text-gray-600">
                {filters.search.trim()
                  ? "Não há aprovações pendentes com os termos de busca aplicados."
                  : "Todas as solicitações foram processadas ou não há novas solicitações pendentes."}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 w-full">
              {approvals.map((approval) => ApprovalComponent(approval))}
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
    </div>
  );
};

export default PendingApprovals;
