"use client";

import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";

import { Card, CardContent } from "@/app/components/ui/card";

import {
  Users,
  UserCheck,
  Shield,
  Calendar,
  AlertTriangle,
} from "lucide-react";

import {
  registeredUsersAtom,
  usersErrorAtom,
  type RegisteredUser,
} from "@/app/atoms/userManagementAtoms";

import { formatDateTime, getRoleNameById, useDebounce } from "@/app/lib/utils";
import { useUserManagementData } from "@/app/hooks/useUserManagementData";
import { PaginationComponent } from "@/app/components/PaginationComponent";
import GenericFilter from "@/app/components/GenericFilter";
import EmptyState from "@/app/components/EmptyState";

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
  <div className="flex items-center justify-between lg:justify-start gap-4">
    <div className="flex items-center gap-3">
      <UserCheck className="h-6 w-6 text-blue-600" />
      <h2 className="text-xl font-bold text-gray-900">Usuários Cadastrados</h2>
    </div>

    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
      {stats.total}
    </div>
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

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "approved", label: "Aprovado" },
  { value: "pending", label: "Pendente" },
  { value: "rejected", label: "Rejeitado" },
];

const sortOptions = [
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigas" },
  { value: "name-asc", label: "Nome (A-Z)" },
  { value: "name-desc", label: "Nome (Z-A)" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RegisteredUsers = () => {
  const [allUsers] = useAtom(registeredUsersAtom);
  const [error] = useAtom(usersErrorAtom);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const {
    pagination,
    stats,
    filters,
    updateSearch,
    updateStatusFilter,
    updateSortBy,
    goToPage,
    resetFilters,
  } = useUserManagementData();

  useEffect(() => {
    const filteredUsers = filterUsers(allUsers, debouncedSearchTerm);
    setUsers(filteredUsers);
  }, [allUsers, debouncedSearchTerm]);

  // Handlers para o filtro genérico
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateSearch(value);
  };
  const handleStatusChange = (value: string) => {
    updateStatusFilter(value);
  };
  const handleSortChange = (value: string) => {
    updateSortBy(value);
  };
  const handleClearFilters = () => {
    setSearchTerm("");
    resetFilters();
  };
  const hasActiveFilters =
    (filters.search && filters.search.trim() !== "") ||
    filters.status !== "all" ||
    filters.sortBy !== "newest";

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Header stats={stats} />

      {/* Filtro Genérico */}
      <GenericFilter
        searchPlaceholder="Buscar por nome ou role..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        statusOptions={statusOptions}
        statusValue={filters.status}
        onStatusChange={handleStatusChange}
        sortOptions={sortOptions}
        sortValue={filters.sortBy}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Users List Section */}
      <Card className="flex flex-col gap-4 ">
        <CardContent className="flex w-full">
          {/* Error State */}
          {error && <ErrorMessage error={error} />}

          {/* Empty State or User Grid */}
          {users.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="h-16 w-16 text-gray-300" />}
              title="Nenhum usuário encontrado"
              description={
                hasActiveFilters
                  ? "Nenhum usuário corresponde aos filtros aplicados."
                  : "Ainda não há usuários cadastrados no sistema."
              }
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
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
