# VibeSeat - Sistema de Agendamento SEJUSP

Sistema de agendamento de cadeiras/assentos desenvolvido para a Secretaria de Estado de Justiça e Segurança Pública (SEJUSP), construído com Next.js 15 e tecnologias modernas.

## 📋 Sobre o Projeto

O VibeSeat é uma aplicação web completa para gerenciamento de agendamentos que oferece:

- **Sistema de autenticação completo** com NextAuth.js e JWT
- **Agendamento inteligente** com slots de tempo configuráveis e verificação de disponibilidade
- **Gerenciamento completo de usuários** com sistema de aprovação e controle de permissões
- **Dashboard administrativo** com métricas em tempo real e insights
- **Interface totalmente responsiva** otimizada para desktop, tablet e mobile
- **Sistema de notificações** em tempo real para feedback do usuário
- **Controle de cadeiras** com diferentes status (Ativa, Manutenção, Inativa)
- **Configuração flexível de horários** com suporte a múltiplos intervalos de tempo
- **Relatórios e insights** para análise de uso do sistema

### Roles e Permissões do Sistema

- **Admin**: Acesso completo - gerenciamento de usuários, cadeiras, horários e configurações do sistema
- **Attendant**: Gerenciamento operacional - aprovação de usuários, gestão de agendamentos e cadeiras
- **User**: Acesso limitado - criação e visualização de próprios agendamentos

## 🛠️ Stack Tecnológico

### Core Framework
- **Next.js 15** com App Router e Turbopack para desenvolvimento otimizado
- **React 19** com TypeScript para tipagem estática
- **Node.js 18+** como runtime

### Interface e Styling
- **Tailwind CSS 4** para estilização utilitária
- **Radix UI** para componentes acessíveis e primitivos
- **Shadcn/ui** como design system base
- **Lucide React** para iconografia consistente
- **Next Themes** para suporte a tema claro/escuro

### Estado e Gerenciamento de Dados
- **Jotai** para gerenciamento de estado global atômico
- **React Hook Form** para formulários performáticos
- **Zod/Yup** para validação de schemas
- **NextAuth.js** para autenticação e sessões JWT

### Experiência do Usuário
- **React Toastify** para sistema de notificações
- **Date-fns** para manipulação avançada de datas
- **React Day Picker** para seleção de datas
- **Máscaras de input** personalizadas para CPF, telefone, etc.

## 🚀 Como Executar o Projeto

### Pré-requisitos

- **Node.js 18+** (recomendado v20 LTS)
- **npm, yarn, pnpm ou bun** como gerenciador de pacotes
- **Git** para versionamento

### Instalação e Configuração

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd vibe-seat
```

2. **Instale as dependências:**
```bash
# Usando npm (recomendado)
npm install

# Ou usando yarn
yarn install

# Ou usando pnpm
pnpm install

# Ou usando bun
bun install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=your-sejusp-api-endpoint
```

4. **Execute em modo de desenvolvimento:**
```bash
npm run dev
```

5. **Acesse a aplicação:**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Scripts Disponíveis

```bash
# Desenvolvimento com Turbopack (Hot Reload otimizado)
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm run start

# Verificação de código (ESLint)
npm run lint
```

### Build e Deploy

Para produção, execute:
```bash
npm run build
npm run start
```

## 📁 Estrutura do Projeto

```
vibe-seat/
├── app/                           # App Router do Next.js 15
│   ├── api/                       # API Routes (Proxy para API SEJUSP)
│   │   ├── appointments/          # Gerenciamento de agendamentos
│   │   ├── approvals/            # Sistema de aprovações
│   │   ├── auth/                 # Autenticação NextAuth
│   │   ├── chairs/               # Gerenciamento de cadeiras
│   │   ├── dashboard/            # Métricas e estatísticas
│   │   ├── schedules/            # Configuração de horários
│   │   └── users/                # Gerenciamento de usuários
│   ├── atoms/                     # Estado global com Jotai
│   │   ├── appointmentAtoms.ts   # Estado de agendamentos
│   │   ├── chairAtoms.ts         # Estado de cadeiras
│   │   ├── userAtoms.ts          # Estado do usuário
│   │   └── ...                   # Outros atoms
│   ├── components/                # Componentes React organizados
│   │   ├── management/           # Interfaces administrativas
│   │   ├── modal/                # Diálogos e popups
│   │   ├── subTab/               # Conteúdo de abas
│   │   ├── ui/                   # Primitivos reutilizáveis
│   │   └── ...                   # Componentes base
│   ├── hooks/                     # Custom hooks para lógica de negócio
│   │   ├── useAppointments.ts    # Lógica de agendamentos
│   │   ├── useAuth.ts            # Lógica de autenticação
│   │   ├── useChairs.ts          # Lógica de cadeiras
│   │   └── ...                   # Outros hooks
│   ├── lib/                       # Utilitários e configurações
│   │   ├── auth.ts               # Configuração NextAuth
│   │   ├── utils.tsx             # Funções utilitárias
│   │   └── apiUtils.ts           # Helpers para API
│   ├── schemas/                   # Validação de formulários
│   │   ├── registerSchema.ts     # Schema de cadastro
│   │   ├── appointmentSchema.ts  # Schema de agendamento
│   │   └── ...                   # Outros schemas
│   ├── types/                     # Definições TypeScript
│   │   ├── api.ts                # Tipos da API SEJUSP
│   │   └── ...                   # Outros tipos
│   ├── home/                      # Página principal pós-login
│   ├── user/                      # Área do usuário comum
│   └── page.tsx                   # Página de login/registro
├── components/                    # Componentes UI externos (shadcn)
│   └── ui/                       # Primitivos do design system
├── public/                        # Assets estáticos
├── CLAUDE.md                      # Instruções para desenvolvimento
└── README.md                      # Documentação do projeto
```

## 🔧 Configuração e Integração

### Variáveis de Ambiente Obrigatórias

```env
# Autenticação NextAuth
NEXTAUTH_SECRET=your-jwt-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# API SEJUSP (Endpoint da API externa)
NEXT_PUBLIC_API_URL=API_BACKEND_IPI:3001

# Opcional para desenvolvimento
NODE_ENV=development
```

### Integração com API SEJUSP

O VibeSeat atua como um **frontend proxy** para a API oficial da SEJUSP:

- **Autenticação JWT**: Tokens gerenciados automaticamente via NextAuth
- **Proxy Pattern**: Todas as chamadas passam pelas rotas `/api/*` do Next.js
- **Interceptação automática**: Headers e tokens adicionados transparentemente
- **Cache inteligente**: Otimização de requisições com estado Jotai
- **Tratamento de erros**: Sistema robusto de fallbacks e retry

## 🏗️ Arquitetura e Padrões

### Design Patterns Implementados

- **Atomic Design**: Organização hierárquica de componentes (Atoms → Molecules → Organisms)
- **Custom Hooks Pattern**: Separação da lógica de negócio dos componentes UI
- **Proxy API Pattern**: Camada de abstração para API externa
- **RBAC (Role-Based Access Control)**: Sistema granular de permissões
- **Atomic State Management**: Estado dividido em pequenos atoms independentes
- **Compound Components**: Componentes complexos com sub-componentes relacionados

### Fluxo de Dados e Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Componentes   │───▶│  Custom Hooks    │───▶│  Jotai Atoms    │
│   React/TSX     │    │  (Lógica)        │    │  (Estado)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌──────────────────┐              │
         │              │   API Routes     │              │
         └──────────────│   (Next.js)      │◀─────────────┘
                        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │   API SEJUSP     │
                        │   (Externa)      │
                        └──────────────────┘
```

## 📱 Funcionalidades Detalhadas

### 👤 Para Usuários Comuns
- **Registro intuitivo** com validação em tempo real de CPF e dados
- **Dashboard personalizado** com visão geral dos agendamentos
- **Sistema de agendamento** com calendário visual e slots disponíveis
- **Histórico completo** de agendamentos com filtros e busca

### 👥 Para Atendentes
- **Painel de aprovações** para gerenciar novos cadastros
- **Gestão de agendamentos** com confirmação e cancelamento
- **Relatórios básicos** de uso e ocupação

### 🔧 Para Administradores
- **Dashboard executivo** com métricas avançadas e insights
- **Gerenciamento completo de cadeiras** (criação, edição, status)
- **Configuração de horários** flexível com múltiplos intervalos
- **Controle total de usuários** e permissões
- **Relatórios detalhados** de uso do sistema
- **Configurações do sistema** e parâmetros globais

## 🔒 Segurança e Compliance

### Medidas de Segurança Implementadas
- **Autenticação JWT robusta** com renovação automática de tokens
- **Validação rigorosa** em frontend e backend com Zod/Yup schemas
- **Sanitização de dados** para prevenção de XSS e injection
- **Rate limiting** nas rotas de API para prevenção de abuse
- **CORS configurado** adequadamente para ambiente de produção
- **Headers de segurança** otimizados (CSP, HSTS, etc.)
- **Criptografia de dados sensíveis** em trânsito e em repouso

## 🧪 Testes e Qualidade

### Ferramentas de Qualidade
- **ESLint**: Análise estática de código JavaScript/TypeScript
- **TypeScript**: Tipagem estática para prevenção de erros
- **Prettier** (recomendado): Formatação consistente de código

---

## 📄 Licença e Créditos

**Desenvolvido para SEJUSP - Secretaria de Estado de Justiça e Segurança Pública**

### Tecnologias Principais
- [Next.js](https://nextjs.org/) - Framework React para produção
- [React](https://react.dev/) - Biblioteca para interfaces de usuário
- [TypeScript](https://www.typescriptlang.org/) - JavaScript com tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Jotai](https://jotai.org/) - Gerenciamento de estado primitivo e flexível

**Versão**: 1.0.0 | **Última atualização**: 27/07/2025