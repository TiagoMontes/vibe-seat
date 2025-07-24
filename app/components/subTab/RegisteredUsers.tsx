"use client";

import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";

import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";

import { Users, Search, UserCheck, Shield, Calendar } from "lucide-react";

import {
  registeredUsersAtom,
  usersErrorAtom,
  type RegisteredUser,
} from "@/app/atoms/userManagementAtoms";

import { formatDateTime, getRoleNameById, useDebounce } from "@/app/lib/utils";
import { useUserManagementData } from "@/app/hooks/useUserManagementData";
import { PaginationComponent } from "@/app/components/PaginationComponent";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusBadge = (status: string): string => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800",
  };

  const statusStyle =
    statusStyles[status as keyof typeof statusStyles] || statusStyles.default;
  return `${baseClasses} ${statusStyle}`;
};

const getStatusLabel = (status: string): string => {
  const statusLabels = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };

  return statusLabels[status as keyof typeof statusLabels] || status;
};

const filterUsers = (
  users: RegisteredUser[],
  searchTerm: string
): RegisteredUser[] => {
  if (!searchTerm.trim()) return users;

  return users.filter((user) => {
    const matchesUsername = user.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesRole =
      user.role?.name &&
      user.role.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesUsername || matchesRole;
  });
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const Header = ({ stats }: { stats: any }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <UserCheck className="h-6 w-6 text-blue-600" />
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Usuários Cadastrados
        </h2>
        <p className="text-gray-600">{stats.total} usuário(s) no sistema</p>
      </div>
    </div>

    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
      {stats.total} total
    </div>
  </div>
);

const SearchBar = ({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou role..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ hasSearchTerm }: { hasSearchTerm: boolean }) => (
  <div className="text-center py-12 w-full justify-center">
    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {hasSearchTerm
        ? "Nenhum usuário encontrado"
        : "Nenhum usuário cadastrado"}
    </h3>
    <p className="text-gray-600">
      {hasSearchTerm
        ? "Tente ajustar os termos de busca."
        : "Ainda não há usuários cadastrados no sistema."}
    </p>
  </div>
);

const ErrorMessage = ({ error }: { error: string }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
    {error}
  </div>
);

const UserCard = ({ user }: { user: RegisteredUser }) => {
  const { date, time } = formatDateTime(user.createdAt || "");

  return (
    <div className="h-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col">
      <div className="flex items-start gap-4 flex-1">
        {/* Avatar */}
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <Users className="h-6 w-6 text-blue-600" />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          {/* Username and Status */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {user.username}
            </h3>
            <span className={getStatusBadge(user.status)}>
              {getStatusLabel(user.status)}
            </span>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 shrink-0" />
              <span className="truncate">
                Role: {getRoleNameById(user.roleId)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 shrink-0" />
              <span>ID: {user.id}</span>
            </div>
            {user.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Criado em: {date} às {time}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserGrid = ({ users }: { users: RegisteredUser[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4">
    {users.map((user) => (
      <UserCard key={user.id} user={user} />
    ))}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RegisteredUsers = () => {
  const [allUsers] = useAtom(registeredUsersAtom);
  const [error] = useAtom(usersErrorAtom);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { pagination, stats, updateSearch, goToPage } = useUserManagementData();

  useEffect(() => {
    const filteredUsers = filterUsers(allUsers, debouncedSearchTerm);
    setUsers(filteredUsers);
  }, [allUsers, debouncedSearchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateSearch(value);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Header stats={stats} />

      {/* Search Section */}
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      {/* Users List Section */}
      <Card className="flex flex-col gap-4 ">
        <CardContent className="flex w-full">
          {/* Error State */}
          {error && <ErrorMessage error={error} />}

          {/* Empty State or User Grid */}
          {users.length === 0 ? (
            <EmptyState hasSearchTerm={!!searchTerm} />
          ) : (
            <UserGrid users={users} />
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
          goToPage={(_, page: number) => goToPage(page)}
          selectedDate=""
        />
      )}
    </div>
  );
};

export default RegisteredUsers;
