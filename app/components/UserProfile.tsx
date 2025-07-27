"use client";

import { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ActivityIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  MailIcon,
  PhoneIcon,
  BuildingIcon,
  BriefcaseIcon,
  MapPin,
  CreditCardIcon,
  CakeIcon,
} from "lucide-react";
import { userAtom } from "@/app/atoms/userAtoms";
import {
  myAppointmentsAtom,
  upcomingAppointmentsAtom,
  myAppointmentsLoadingAtom,
} from "@/app/atoms/appointmentAtoms";
import { useAppointments } from "@/app/hooks/useAppointments";
import { useUsers } from "@/app/hooks/useUsers";
import {
  formatDateTimeRange,
  getStatusColor,
  getStatusLabel,
  getStatusVariant,
} from "@/app/lib/utils";
import { useToast } from "@/app/hooks/useToast";
import { signOut } from "next-auth/react";

export const UserProfilePage = () => {
  const router = useRouter();
  const { fetchMyAppointments } = useAppointments();
  const { getUser } = useUsers();
  const { appointmentError } = useToast();

  // User data from atoms
  const [user, setUser] = useAtom(userAtom);

  // Appointments data
  const [myAppointments] = useAtom(myAppointmentsAtom);
  const [upcomingAppointments] = useAtom(upcomingAppointmentsAtom);
  const [appointmentsLoading] = useAtom(myAppointmentsLoadingAtom);

  const [initialLoading, setInitialLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const hasLoadedOnceRef = useRef(false);
  const fetchMyAppointmentsRef = useRef(fetchMyAppointments);
  const appointmentErrorRef = useRef(appointmentError);

  // Update refs
  fetchMyAppointmentsRef.current = fetchMyAppointments;
  appointmentErrorRef.current = appointmentError;

  // Buscar dados completos do usuário quando a página for carregada
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const userData = await getUser(user.id);
        console.log(userData);
        if (userData) {
          // Atualizar o userAtom com os dados completos, mantendo os dados básicos existentes
          setUser({
            ...user, // Mantém id, username, role, status
            fullName: userData.fullName,
            cpf: userData.cpf,
            jobFunction: userData.jobFunction,
            position: userData.position,
            registration: userData.registration,
            sector: userData.sector,
            email: userData.email,
            phone: userData.phone,
            gender: userData.gender,
            birthDate: userData.birthDate,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadUserProfile();
  }, [user?.id, getUser, setUser]);

  // Fetch user appointments on mount - using useEffect with minimal dependencies
  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setInitialLoading(false);
      return;
    }

    if (hasLoadedOnceRef.current) {
      setInitialLoading(false);
      return;
    }

    const loadAppointments = async () => {
      try {
        await fetchMyAppointmentsRef.current({ limit: 5 }); // Load only recent appointments
        if (isMounted) {
          hasLoadedOnceRef.current = true;
        }
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
        if (isMounted) {
          appointmentErrorRef.current(
            "Erro ao carregar agendamentos do usuário"
          );
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user]); // Only depend on user.id - functions are stable via refs

  // Redirect if not authenticated
  useEffect(() => {
    // Só redireciona se não estiver carregando e não houver usuário
    if (!initialLoading && !profileLoading && !user) {
      router.push("/");
    }
  }, [user, initialLoading, profileLoading, router]);

  const getRoleInfo = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return {
          label: "Administrador",
          variant: "destructive" as const,
          icon: ShieldCheckIcon,
          description: "Acesso total ao sistema",
        };
      case "attendant":
        return {
          label: "Atendente",
          variant: "secondary" as const,
          icon: UserIcon,
          description: "Gerenciamento de agendamentos",
        };
      default:
        return {
          label: "Usuário",
          variant: "outline" as const,
          icon: UserIcon,
          description: "Acesso básico ao sistema",
        };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "approved":
        return {
          label: "Aprovado",
          variant: "default" as const,
          color: "text-green-600",
        };
      case "rejected":
        return {
          label: "Rejeitado",
          variant: "destructive" as const,
          color: "text-red-600",
        };
      case "pending":
      default:
        return {
          label: "Pendente",
          variant: "secondary" as const,
          color: "text-yellow-600",
        };
    }
  };

  const recentAppointments = myAppointments.slice(0, 3);
  const roleInfo = getRoleInfo(user?.role ?? "");
  const statusInfo = getStatusInfo(user?.status ?? "");
  const RoleIcon = roleInfo.icon;

  // Loading state
  if (initialLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Carregando perfil...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/home")}
                className="flex items-center gap-2"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Voltar
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold text-gray-900">
                Perfil do Usuário
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Header */}
            <Card className="bg-transparent flex flex-col gap-2 border p-4">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">
                  {user.username}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 mt-2">
                  <RoleIcon className="h-4 w-4" />
                  {roleInfo.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Tipo de Conta
                  </span>
                  <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    ID do Usuário
                  </span>
                  <span className="text-sm text-gray-900 font-mono">
                    #{user.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Status da Conta
                  </span>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>

                {/* Personal Information */}
                <Card className="bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription>
                      Dados pessoais e de contato
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Nome
                        </p>
                        <p className="text-sm text-gray-600">{user.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Email
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Telefone
                        </p>
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CakeIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Data de Nascimento
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.birthDate
                            ? new Date(user.birthDate).toLocaleDateString(
                                "pt-BR"
                              )
                            : "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Gênero
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.gender === "M"
                            ? "Masculino"
                            : user.gender === "F"
                            ? "Feminino"
                            : user.gender === "Outro"
                            ? "Outro"
                            : "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CreditCardIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">CPF</p>
                        <p className="text-sm text-gray-600">
                          {user.cpf || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Informações Profissionais
                    </CardTitle>
                    <CardDescription>
                      Dados relacionados ao trabalho
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <BuildingIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Setor
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.sector || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Cargo
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.position || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Função
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.jobFunction || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Matrícula
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.registration || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-white bg-black hover:bg-black/80"
                    onClick={() => signOut()}
                  >
                    <LogOutIcon className="h-4 w-4 mr-2" />
                    Sair da Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total de Agendamentos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {myAppointments.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Agendamentos Ativos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {
                          myAppointments.filter(
                            (apt) =>
                              apt.status === "SCHEDULED" ||
                              apt.status === "CONFIRMED"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ActivityIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Próximas 24h
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {upcomingAppointments.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <Card className="bg-transparent flex flex-col gap-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Agendamentos Recentes</CardTitle>
                    <CardDescription>
                      Seus últimos agendamentos no sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span>Carregando agendamentos...</span>
                    </div>
                  </div>
                ) : recentAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum agendamento encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Você ainda não possui agendamentos no sistema
                    </p>
                    <Button onClick={() => router.push("/home")}>
                      Fazer Agendamento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => {
                      const { date, timeRange } = formatDateTimeRange(
                        appointment.datetimeStart,
                        appointment.datetimeEnd
                      );

                      return (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <CalendarIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Agendamento #{appointment.id}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-3 w-3" />
                                  {timeRange}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  {appointment.chair?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`${getStatusColor(appointment.status)}`}
                            variant={
                              getStatusVariant(appointment.status) as
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline"
                            }
                          >
                            {getStatusLabel(appointment.status)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
