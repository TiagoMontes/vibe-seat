"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/app/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  UserIcon,
  LogOutIcon,
  RefreshCwIcon
} from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, getStatusLabel, getRoleLabel } = usePermissions();

  const handleLogout = () => {
    // Aqui você implementaria a lógica de logout
    router.push('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!user) {
    router.push('/');
    return null;
  }

  const getStatusIcon = () => {
    switch (user.status) {
      case 'approved':
        return <CheckCircleIcon className="h-12 w-12 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-12 w-12 text-red-500" />;
      case 'pending':
      default:
        return <ClockIcon className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getStatusVariant = () => {
    switch (user.status) {
      case 'approved':
        return 'default' as const;
      case 'rejected':
        return 'destructive' as const;
      case 'pending':
      default:
        return 'secondary' as const;
    }
  };

  const getStatusMessage = () => {
    switch (user.status) {
      case 'approved':
        return {
          title: 'Cadastro Aprovado!',
          description: 'Seu acesso foi liberado. Você já pode utilizar o sistema.',
          action: 'Acessar Sistema'
        };
      case 'rejected':
        return {
          title: 'Cadastro Rejeitado',
          description: 'Infelizmente seu cadastro não foi aprovado. Entre em contato com a administração para mais informações.',
          action: 'Tentar Novamente'
        };
      case 'pending':
      default:
        return {
          title: 'Aguardando Aprovação',
          description: 'Seu cadastro está sendo analisado pela equipe de administração. Você será notificado quando for aprovado.',
          action: 'Atualizar Status'
        };
    }
  };

  const statusInfo = getStatusMessage();

  const handleAction = () => {
    switch (user.status) {
      case 'approved':
        router.push('/home');
        break;
      case 'rejected':
        // Aqui poderia redirecionar para um formulário de re-cadastro
        handleLogout();
        break;
      case 'pending':
      default:
        handleRefresh();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">{statusInfo.title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {statusInfo.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">{user.username}</span>
              </div>
              <Badge variant="outline">{getRoleLabel()}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Status do Cadastro</span>
              <Badge variant={getStatusVariant()}>{getStatusLabel()}</Badge>
            </div>
          </div>

          {/* Information Messages */}
          <div className="space-y-3">
            {user.status === 'pending' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Análise em Andamento</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Nossa equipe está verificando suas informações. Este processo pode levar até 24 horas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user.status === 'rejected' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Cadastro Não Aprovado</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Entre em contato com a administração através do email: admin@sejusp.gov.br
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user.status === 'approved' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Bem-vindo ao VibeSeat!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Seu cadastro foi aprovado. Você já pode acessar todas as funcionalidades do sistema.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleAction}
              className="flex-1 flex items-center gap-2"
              variant={user.status === 'approved' ? 'default' : 'outline'}
            >
              {user.status === 'pending' && <RefreshCwIcon className="h-4 w-4" />}
              {statusInfo.action}
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <LogOutIcon className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}