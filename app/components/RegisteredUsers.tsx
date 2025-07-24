"use client";

import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Users, Search, UserCheck, Shield, Calendar } from "lucide-react";
import {
  registeredUsersAtom,
  usersLoadingAtom,
  usersErrorAtom,
  type RegisteredUser,
} from "@/app/atoms/userManagementAtoms";
import { getRoleByName } from "@/app/lib/utils";

export const RegisteredUsers = () => {
  const [allUsers] = useAtom(registeredUsersAtom);
  const [loading] = useAtom(usersLoadingAtom);
  const [error] = useAtom(usersErrorAtom);

  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let filtered = [...allUsers];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.role?.name &&
            user.role.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setUsers(filtered);
  }, [allUsers, searchTerm]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não disponível";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Usuários Cadastrados
            </h2>
            <p className="text-gray-600">
              {allUsers.length} usuário(s) no sistema
            </p>
          </div>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {allUsers.length} total
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex w-full">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm
                  ? "Nenhum usuário encontrado"
                  : "Nenhum usuário cadastrado"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Tente ajustar os termos de busca."
                  : "Ainda não há usuários cadastrados no sistema."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4">
              {users.map((user) => {
                return (
                  <div
                    key={user.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {user.username}
                            </h3>
                            <span className={getStatusBadge(user.status)}>
                              {user.status === "pending" && "Pendente"}
                              {user.status === "approved" && "Aprovado"}
                              {user.status === "rejected" && "Rejeitado"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              <span>Role: {getRoleByName(user.roleId)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>ID: {user.id}</span>
                            </div>
                            {user.createdAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Criado em: {formatDate(user.createdAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-gray-400"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisteredUsers;
