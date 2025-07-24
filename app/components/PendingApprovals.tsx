"use client";

import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import { Users, Search, Check, X, Clock, Calendar } from "lucide-react";
import {
  approvalsLoadingAtom,
  pendingCountAtom,
  type Approval,
} from "@/app/atoms/userManagementAtoms";
import { formatDateTime, getRoleByName } from "@/app/lib/utils";
import { useApprovals } from "../hooks/useApprovals";

const PendingApprovals = () => {
  const [loading] = useAtom(approvalsLoadingAtom);
  const [pendingCount] = useAtom(pendingCountAtom);
  const { updateApprovalStatus,searchTerm, setSearchTerm, pendingApprovals } = useApprovals();

  const handleApproval = async (
    approvalId: number,
    status: "approved" | "rejected"
  ) => {
    await updateApprovalStatus(approvalId, status);
  };

  const approvalComponent = (approval: Approval) => {
    const { date, time } = formatDateTime(approval.createdAt);

    return (
      <div
        key={approval.id}
        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {approval.user.username}
                </h3>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  Pendente
                </span>
              </div>
              <p className="text-gray-700">
                Solicitando acesso como:{" "}
                <span className="font-semibold text-blue-600">
                  {getRoleByName(approval.requestedRole.name)}
                </span>
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Solicitado em: {date}, {time}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>ID: {approval.user.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 ml-4">
            <Button
              onClick={() => handleApproval(approval.id, "approved")}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Check className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
            <Button
              onClick={() => handleApproval(approval.id, "rejected")}
              variant="destructive"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando aprovações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-orange-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Aprovações Pendentes
            </h2>
            <p className="text-gray-600">
              {pendingCount} solicitação(ões) aguardando aprovação
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingCount} pendente(s)
          </div>
        )}
      </div>

      <Card>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por usuário ou role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex justify-center">
          {pendingApprovals.length === 0 ? (
            <div className="text-center flex flex-col gap-2">
              <Clock className="h-16 w-16 text-gray-300 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">
                Nenhuma aprovação pendente
              </h3>
              <p className="text-gray-600">
                Todas as solicitações foram processadas ou não há novas
                solicitações.
              </p>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4">
              {pendingApprovals.map((approval) => approvalComponent(approval))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApprovals;
