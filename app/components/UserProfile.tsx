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
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/home")}
                className="flex items-center gap-1 sm:gap-2"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Perfil do Usuário
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Profile Header */}
            <Card className="bg-transparent flex flex-col gap-2 border p-3 sm:p-4">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  {user.username}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-1 sm:gap-2 mt-2 text-sm sm:text-base">
                  <RoleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-center">{roleInfo.description}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Tipo de Conta
                  </span>
                  <Badge variant={roleInfo.variant} className="self-start sm:self-auto text-xs">
                    {roleInfo.label}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    ID do Usuário
                  </span>
                  <span className="text-xs sm:text-sm text-gray-900 font-mono">
                    #{user.id}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Status da Conta
                  </span>
                  <Badge variant={statusInfo.variant} className="self-start sm:self-auto text-xs">
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Personal Information */}
                <Card className="bg-transparent">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Dados pessoais e de contato
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Nome
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          {user.fullName || "Não informado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <MailIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Email
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 break-all">
                          {user.email || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Telefone
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {user.phone || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <CakeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Data de Nascimento
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {user.birthDate
                            ? new Date(user.birthDate).toLocaleDateString(
                                "pt-BR"
                              )
                            : "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Gênero
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
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

                    <div className="flex items-start gap-2 sm:gap-3">
                      <CreditCardIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">CPF</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {user.cpf || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="bg-transparent">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">
                      Informações Profissionais
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Dados relacionados ao trabalho
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <BuildingIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Setor
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          {user.sector || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <BriefcaseIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Cargo
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          {user.position || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Função
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          {user.jobFunction || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Matrícula
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {user.registration || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                <div className="space-y-2 sm:space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-white bg-black hover:bg-black/80 text-sm sm:text-base py-2 sm:py-3"
                    onClick={() => signOut()}
                  >
                    <LogOutIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Sair da Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Recent Activity */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg self-start">
                      <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Total de Agendamentos
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {myAppointments.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg self-start">
                      <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Agendamentos Ativos
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
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
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg self-start">
                      <ActivityIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Próximas 24h
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {upcomingAppointments.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <Card className="bg-transparent flex flex-col gap-2">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Agendamentos Recentes</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Seus últimos agendamentos no sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm sm:text-base">Carregando agendamentos...</span>
                    </div>
                  </div>
                ) : recentAppointments.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      Nenhum agendamento encontrado
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                      Você ainda não possui agendamentos no sistema
                    </p>
                    <Button 
                      onClick={() => router.push("/home")}
                      className="text-sm sm:text-base"
                    >
                      Fazer Agendamento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {recentAppointments.map((appointment) => {
                      const { date, timeRange } = formatDateTimeRange(
                        appointment.datetimeStart,
                        appointment.datetimeEnd
                      );

                      return (
                        <div
                          key={appointment.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-4"
                        >
                          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">
                                Agendamento #{appointment.id}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
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
                                  <span className="truncate">{appointment.chair?.name}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`${getStatusColor(appointment.status)} self-start sm:self-auto text-xs`}
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
