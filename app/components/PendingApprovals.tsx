"use client";

import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import { Users, Search, Check, X, Clock, Calendar } from "lucide-react";
import {
  approvalsAtom,
  approvalsLoadingAtom,
  approvalsErrorAtom,
  pendingCountAtom,
  syncUsersWithApprovalsAtom,
  type Approval,
} from "@/app/atoms/userManagementAtoms";

const PendingApprovals = () => {
  const [allApprovals, setAllApprovals] = useAtom(approvalsAtom);
  const [loading, setLoading] = useAtom(approvalsLoadingAtom);
  const [error, setError] = useAtom(approvalsErrorAtom);
  const [pendingCount] = useAtom(pendingCountAtom);
  const [, syncUsers] = useAtom(syncUsersWithApprovalsAtom);

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Função para atualizar status da aprovação
  const updateApprovalStatus = async (
    approvalId: number,
    status: "approved" | "rejected"
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/approvals/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approvalId,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar aprovação");
      }

      // Atualizar o approval na lista local
      setAllApprovals((prev) =>
        prev.map((approval) =>
          approval.id === approvalId ? { ...approval, status } : approval
        )
      );

      // Sincronizar com a lista de usuários
      syncUsers(null);

      const statusText = status === "approved" ? "aprovado" : "rejeitado";
      toast.success(`Usuário ${statusText} com sucesso!`);

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(errorMessage);
      return false;
    }
  };

  const handleApproval = async (
    approvalId: number,
    status: "approved" | "rejected"
  ) => {
    await updateApprovalStatus(approvalId, status);
  };

  // Filtrar apenas aprovações pendentes
  useEffect(() => {
    let filtered = allApprovals.filter(
      (approval) => approval.status === "pending"
    );

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (approval) =>
          approval.user.username
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          approval.requestedRole.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setApprovals(filtered);
  }, [allApprovals, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div className="space-y-6">
      {/* Header com contador */}
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

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
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

      {/* Lista de Aprovações */}
      <Card>
        <CardContent className="pt-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
              {error}
            </div>
          )}

          {approvals.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma aprovação pendente
              </h3>
              <p className="text-gray-600">
                Todas as solicitações foram processadas ou não há novas
                solicitações.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {approval.user.username}
                          </h3>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            Pendente
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">
                          Solicitando acesso como:{" "}
                          <span className="font-semibold text-blue-600">
                            {approval.requestedRole.name}
                          </span>
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Solicitado em: {formatDate(approval.createdAt)}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApprovals;
