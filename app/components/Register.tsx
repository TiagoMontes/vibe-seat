"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { User, Lock, AlertCircle, UserPlus } from "lucide-react";
import {
  registerSchema,
  type RegisterFormData,
} from "@/app/schemas/registerSchema";
import { useRoles } from "@/app/hooks/useRoles";
import { useUsers } from "@/app/hooks/useUsers";

interface RegisterProps {
  onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();
  const { createUser, loading: createLoading } = useUsers();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      roleId: undefined,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const success = await createUser({
      username: data.username,
      password: data.password,
      roleId: data.roleId,
    });

    if (success) {
      reset();
      // Voltar para login após sucesso
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    }
  };

  const isLoading = createLoading || isSubmitting;

  return (
    <Card className="w-full max-w-md lg:border lg:border-gray-300">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-blue-600 mb-2">
          Criar Conta
        </CardTitle>
        <p className="text-sm text-gray-600">
          Preencha os dados para solicitar acesso
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  className={`pl-10 bg-white  ${errors.username ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  className={`pl-10 bg-white  ${errors.password ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  className={`pl-10 bg-white ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="roleId">Tipo de Acesso</Label>
              <select
                id="roleId"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.roleId ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading || rolesLoading}
                {...register("roleId", { valueAsNumber: true })}
              >
                <option value="">Selecione um tipo de acesso</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.roleId.message}
                </span>
              )}
              {rolesError && (
                <span className="text-sm text-red-500 mt-1">{rolesError}</span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || rolesLoading}
          >
            {isLoading ? (
              <>
                <UserPlus className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Conta
              </>
            )}
          </Button>
        </form>

        <Button
          variant="outline"
          onClick={onBackToLogin}
          className="w-full mt-2 "
        >
          Voltar ao Login
        </Button>
      </CardContent>
    </Card>
  );
};

export default Register;
