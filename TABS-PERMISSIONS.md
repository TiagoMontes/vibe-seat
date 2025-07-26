# Sistema de Tabs por Permissão

## 📋 Resumo das Mudanças

Atualizei o sistema de tabs no layout para refletir corretamente as permissões hierárquicas baseadas nos roles do usuário.

## 🎯 Tabs Disponíveis por Role

### 👤 **USUÁRIOS (user role)**
```
✅ Meus Agendamentos (dashboard)
```
- **Funcionalidades**: Criar, visualizar e cancelar próprios agendamentos
- **API Access**: POST /appointments, GET /appointments/my-appointments, PATCH /appointments/:id/cancel
- **UI**: Lista de agendamentos pessoais, criação de novos agendamentos

### 👨‍💼 **ATENDENTES (attendant role)**
```
✅ Meus Agendamentos (dashboard)
✅ Usuários
✅ Agendamentos (gestão)
```
- **Funcionalidades**: Todas do usuário + gerenciar aprovações + ver todos agendamentos
- **API Access**: Todas do user + GET /approvals, PATCH /approvals/:id, GET /appointments, PATCH /appointments/:id/confirm
- **UI**: Dashboard de gestão, aprovação de usuários, confirmação de agendamentos

### 👨‍💻 **ADMINISTRADORES (admin role)**
```
✅ Meus Agendamentos (dashboard)
✅ Usuários
✅ Agendamentos (gestão)
✅ Cadeiras
✅ Horários
```
- **Funcionalidades**: Todas do atendente + gerenciar cadeiras + configurar horários
- **API Access**: Todas do attendant + POST/PATCH/DELETE /chairs, POST/PATCH/DELETE /schedules
- **UI**: Gestão completa do sistema, CRUD de cadeiras, configuração de horários

## 🔧 Implementação Técnica

### Lógica de Permissões
```typescript
const tabs: Tab[] = [
  // Dashboard - sempre disponível para usuários autenticados
  {
    key: "dashboard",
    label: hasRole('user') ? "Meus Agendamentos" : "Dashboard",
    icon: <Home className="h-4 w-4" />,
    component: children,
  },
  
  // Usuários - apenas para attendant e admin
  ...(canApproveUsers ? [/*...*/] : []),
  
  // Agendamentos (gestão) - para attendant e admin
  ...(canManageAppointments ? [/*...*/] : []),
  
  // Cadeiras - apenas para admin
  ...(canManageChairs ? [/*...*/] : []),
  
  // Schedules - apenas para admin
  ...(canManageChairs ? [/*...*/] : []),
];
```

### Verificação de Permissões
```typescript
// Se o usuário não tem permissão para a aba ativa, voltar para dashboard
React.useEffect(() => {
  const hasPermissionForCurrentTab = tabs.some(tab => tab.key === activeTab);
  
  if (!hasPermissionForCurrentTab) {
    setActiveTab("dashboard");
  }
}, [activeTab, tabs]);
```

## 🎨 Interface por Role

### User (Usuário Comum)
- **Sidebar**: Apenas "Meus Agendamentos"
- **Funcionalidade Principal**: Gerenciar agendamentos pessoais
- **Redirecionamento**: `/home` após login

### Attendant (Atendente)
- **Sidebar**: Meus Agendamentos + Usuários + Agendamentos
- **Funcionalidade Principal**: Gestão de usuários e agendamentos
- **Redirecionamento**: `/management` após login

### Admin (Administrador)
- **Sidebar**: Todas as tabs disponíveis
- **Funcionalidade Principal**: Gestão completa do sistema
- **Redirecionamento**: `/management` após login

## ✅ Benefícios da Nova Implementação

1. **Segurança**: Tabs são renderizadas condicionalmente baseadas em permissões reais
2. **UX**: Interface limpa e focada no que o usuário pode fazer
3. **Manutenibilidade**: Sistema centralizado de permissões
4. **Escalabilidade**: Fácil adicionar/remover funcionalidades por role
5. **Consistência**: Mesma lógica de permissões em toda aplicação

## 🔄 Fluxo de Navegação

1. **Login** → NextAuth valida e armazena dados com `status` e `role`
2. **Sincronização** → `useUserData` transfere dados para Jotai atoms
3. **Permissões** → `usePermissions` calcula permissões baseadas em role+status
4. **Renderização** → Layout mostra apenas tabs permitidas
5. **Proteção** → `ProtectedRoute` bloqueia acesso direto via URL

Este sistema garante que cada usuário veja apenas as funcionalidades que tem permissão para usar! 🎉