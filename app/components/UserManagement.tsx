"use client";

import React from "react";
import {
  useApprovals,
  type ApprovalStatus,
  type Approval,
} from "@/app/hooks/useApprovals";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import {
  Users,
  Search,
  Check,
  X,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const UserManagement = () => {
  const {
    approvals,
    allApprovals,
    loading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    pendingCount,
    updateApprovalStatus,
  } = useApprovals();

  const handleApproval = async (
    approvalId: number,
    status: "approved" | "rejected"
  ) => {
    await updateApprovalStatus(approvalId, status);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingApprovals = allApprovals.filter(
    (approval) => approval.status === "pending"
  );

  if (loading && allApprovals.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">
            Gerencie aprovações e permissões de usuários
          </p>
        </div>
      </div>

      {/* Alerta de Aprovações Pendentes */}
      {pendingCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              {pendingCount} Aprovação(ões) Pendente(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.slice(0, 3).map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {approval.user.username}
                    </p>
                    <p className="text-sm text-gray-600">
                      Solicitando acesso como:{" "}
                      <span className="font-medium">
                        {approval.requestedRole.name}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproval(approval.id, "approved")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApproval(approval.id, "rejected")}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
            {pendingApprovals.length > 3 && (
              <p className="text-sm text-orange-700 text-center pt-2">
                E mais {pendingApprovals.length - 3} aprovação(ões)
                pendente(s)...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuário ou role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros por Status */}
            <div className="flex gap-2">
              {(
                ["all", "pending", "approved", "rejected"] as ApprovalStatus[]
              ).map((status) => {
                const isActive = filter === status;
                const count =
                  status === "all"
                    ? allApprovals.length
                    : allApprovals.filter((a) => a.status === status).length;

                const getButtonClass = () => {
                  if (isActive) {
                    switch (status) {
                      case "pending":
                        return "bg-yellow-600 hover:bg-yellow-700 text-white";
                      case "approved":
                        return "bg-green-600 hover:bg-green-700 text-white";
                      case "rejected":
                        return "bg-red-600 hover:bg-red-700 text-white";
                      default:
                        return "bg-blue-600 hover:bg-blue-700 text-white";
                    }
                  }
                  return "bg-gray-100 hover:bg-gray-200 text-gray-700";
                };

                const getIcon = () => {
                  switch (status) {
                    case "pending":
                      return <Clock className="h-4 w-4" />;
                    case "approved":
                      return <UserCheck className="h-4 w-4" />;
                    case "rejected":
                      return <UserX className="h-4 w-4" />;
                    default:
                      return <Users className="h-4 w-4" />;
                  }
                };

                const getLabel = () => {
                  switch (status) {
                    case "all":
                      return "Todos";
                    case "pending":
                      return "Pendentes";
                    case "approved":
                      return "Aprovados";
                    case "rejected":
                      return "Rejeitados";
                    default:
                      return status;
                  }
                };

                return (
                  <Button
                    key={status}
                    size="sm"
                    onClick={() => setFilter(status)}
                    className={getButtonClass()}
                  >
                    {getIcon()}
                    <span className="ml-1">{getLabel()}</span>
                    <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados ({approvals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
              {error}
            </div>
          )}

          {approvals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {approval.user.username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Role:{" "}
                        <span className="font-medium">
                          {approval.requestedRole.name}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(approval.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={getStatusBadge(approval.status)}>
                      {approval.status === "pending" && "Pendente"}
                      {approval.status === "approved" && "Aprovado"}
                      {approval.status === "rejected" && "Rejeitado"}
                    </span>

                    {approval.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleApproval(approval.id, "approved")
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleApproval(approval.id, "rejected")
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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

export default UserManagement;
