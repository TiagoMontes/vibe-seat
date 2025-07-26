"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User, Lock, UserPlus } from "lucide-react";
import {
  registerZodSchema,
  type RegisterZodFormData,
} from "@/app/schemas/registerSchema";
import { useRoles } from "@/app/hooks/useRoles";
import { useUsers } from "@/app/hooks/useUsers";
import { Role } from "@/app/types/api";
import { getRoleNameById } from "../lib/utils";
import { useToast } from "@/app/hooks/useToast";

interface RegisterProps {
  onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
  const { getRoles } = useRoles();
  const { createUser } = useUsers();
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const { success, error } = useToast();

  const form = useForm<RegisterZodFormData>({
    resolver: zodResolver(registerZodSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      roleId: undefined,
    },
  });

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      setRolesError(null);
      try {
        const response = await getRoles();

        if (response) {
          setRoles(response);
        }
      } catch (err) {
        error("Erro ao carregar tipos de acesso");
        console.error("Erro ao buscar roles:", err);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [getRoles]);

  const onSubmit = async (data: RegisterZodFormData) => {
    setCreateLoading(true);
    try {
      const response = await createUser({
        username: data.username,
        password: data.password,
        roleId: data.roleId,
      });

      if (response) {
        success("Usuário criado com sucesso");
        form.reset();
        onBackToLogin();
      }
    } catch (err) {
      error("Erro ao criar usuário");
      console.error("Erro ao criar usuário:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const isLoading = createLoading || form.formState.isSubmitting;

  return (
    <Card className="w-full p-4 max-w-md lg:border lg:border-gray-300">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-blue-600 mb-2">
          Criar Conta
        </CardTitle>
        <p className="text-sm text-gray-600">
          Preencha os dados para solicitar acesso
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Digite seu usuário"
                          className="pl-10 bg-white"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Digite sua senha"
                          className="pl-10 bg-white"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Confirme sua senha"
                          className="pl-10 bg-white"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Acesso</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                        disabled={isLoading || rolesLoading}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value || ""}
                      >
                        <option value="">Selecione um tipo de acesso</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {getRoleNameById(Number(role.id))}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                    {rolesError && (
                      <span className="text-sm text-red-500 mt-1">
                        {rolesError}
                      </span>
                    )}
                  </FormItem>
                )}
              />
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
        </Form>

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
