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
import {
  User,
  Lock,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Building,
  Briefcase,
  IdCard,
} from "lucide-react";
import {
  registerZodSchema,
  type RegisterZodFormData,
} from "@/app/schemas/registerSchema";
import { useRoles } from "@/app/hooks/useRoles";
import { useUsers } from "@/app/hooks/useUsers";
import { Role } from "@/app/types/api";
import { getRoleNameById } from "../lib/utils";
import { useToast } from "@/app/hooks/useToast";
import { applyCPFMask, applyPhoneMask } from "@/app/lib/inputMasks";

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
      fullName: "",
      cpf: "",
      jobFunction: "",
      position: "",
      registration: "",
      sector: "",
      email: "",
      phone: "",
      gender: undefined,
      birthDate: "",
    },
  });

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const rolesData = await getRoles();
        if (rolesData) {
          setRoles(rolesData);
        }
      } catch (err) {
        error("Erro ao carregar tipos de acesso");
        console.error("Erro ao buscar roles:", err);
        setRolesError("Erro ao carregar tipos de acesso");
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [getRoles, error]); // Added missing dependencies

  const onSubmit = async (data: RegisterZodFormData) => {
    setCreateLoading(true);
    try {
      const result = await createUser({
        username: data.username,
        password: data.password,
        roleId: data.roleId,
        fullName: data.fullName,
        cpf: data.cpf,
        jobFunction: data.jobFunction,
        position: data.position,
        registration: data.registration,
        sector: data.sector,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        birthDate: data.birthDate,
      });

      if (result.success) {
        success(result.message || "Usuário criado com sucesso");
        form.reset();
        onBackToLogin();
      } else {
        const errorMessages: Record<string, string> = {
          "Username já está em uso": "Este nome de usuário já está em uso",
          "CPF já está cadastrado": "Este CPF já está em uso",
          "E-mail já está cadastrado": "Este e-mail já está em uso",
          "Matrícula já está cadastrada": "Esta matrícula já está em uso",
          "E-mail inválido": "Formato de e-mail inválido",
          "CPF deve estar no formato XXX.XXX.XXX-XX ou apenas números":
            "CPF deve ter formato válido",
          "Campo obrigatório ausente: fullName": "Nome completo é obrigatório",
          "Campo obrigatório ausente: username":
            "Nome de usuário é obrigatório",
          "Campo obrigatório ausente: password": "Senha é obrigatória",
          "Campo obrigatório ausente: roleId": "Tipo de acesso é obrigatório",
        };

        const finalMessage = errorMessages[result.message] || result.message;
        error(finalMessage);
      }
    } catch (err: unknown) {
      // Tratamento de erros de rede ou outros erros
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar usuário";
      error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const isLoading = createLoading || form.formState.isSubmitting;

  return (
    <Card className="w-full p-4 max-w-2xl lg:border lg:border-gray-300 max-h-[90vh] overflow-y-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-blue-600 mb-2">
          Criar Conta
        </CardTitle>
        <p className="text-sm text-gray-600">
          Preencha todos os dados para solicitar acesso
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              {/* Dados de acesso */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 border-b pb-1">
                  Dados de Acesso
                </h3>

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
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
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

              {/* Dados pessoais */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 border-b pb-1">
                  Dados Pessoais
                </h3>

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Digite seu nome completo"
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
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="000.000.000-00"
                            className="pl-10 bg-white"
                            disabled={isLoading}
                            {...field}
                            onChange={(e) => {
                              const maskedValue = applyCPFMask(e.target.value);
                              field.onChange(maskedValue);
                            }}
                            maxLength={14}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="seu@email.com"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="(00) 00000-0000"
                            className="pl-10 bg-white"
                            disabled={isLoading}
                            {...field}
                            onChange={(e) => {
                              const maskedValue = applyPhoneMask(
                                e.target.value
                              );
                              field.onChange(maskedValue);
                            }}
                            maxLength={15}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <FormControl>
                          <select
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                            disabled={isLoading}
                            {...field}
                            value={field.value || ""}
                          >
                            <option value="">Selecione</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="date"
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
                </div>
              </div>

              {/* Dados profissionais */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 border-b pb-1">
                  Dados Profissionais
                </h3>

                <FormField
                  control={form.control}
                  name="jobFunction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Digite sua função"
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
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Digite seu cargo"
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
                  name="registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matrícula</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Digite sua matrícula"
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
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Digite seu setor"
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
