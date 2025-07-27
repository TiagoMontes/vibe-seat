# VibeSeat - Sistema de Agendamento SEJUSP

Sistema de agendamento de cadeiras/assentos desenvolvido para a Secretaria de Estado de Justiça e Segurança Pública (SEJUSP), construído com Next.js 15 e tecnologias modernas.

## 📋 Sobre o Projeto

O VibeSeat é uma aplicação web completa para gerenciamento de agendamentos que permite:

- **Autenticação e autorização** com controle de acesso baseado em roles
- **Agendamento de cadeiras/assentos** com slots de tempo configuráveis
- **Gerenciamento de usuários** com aprovação de cadastros
- **Dashboard administrativo** para controle completo do sistema
- **Interface responsiva** para desktop e mobile

### Roles do Sistema

- **Admin**: Acesso completo ao sistema
- **Attendant**: Gerenciamento de agendamentos e usuários
- **User**: Realizar e visualizar próprios agendamentos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** com App Router e Turbopack
- **React 19** com TypeScript
- **Tailwind CSS 4** para estilização
- **Radix UI** para componentes acessíveis
- **Lucide React** para ícones

### Estado e Dados
- **Jotai** para gerenciamento de estado global
- **React Hook Form** com validação Zod/Yup
- **NextAuth.js** para autenticação JWT

### UI/UX
- **Shadcn/ui** para componentes de design system
- **React Toastify** para notificações
- **Date-fns** para manipulação de datas
- **Next Themes** para suporte a tema escuro

## 🚀 Como Executar o Projeto

### Pré-requisitos

- **Bun** instalado (versão mais recente)
- **Node.js** 18+ (para compatibilidade)

### Instalação

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd vibe-seat
```

2. **Instale as dependências:**
```bash
bun install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

4. **Execute o build:**
```bash
bun run build
```

4. **Execute a aplicação de forma otimizada:**
```bash
bun run start
```

5. **Acesse a aplicação:**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Scripts Disponíveis

```bash
# Desenvolvimento com Turbopack
bun run dev

# Build para produção
bun run build

# Executar em produção
bun run start

# Linting
bun run lint
```

## 📁 Estrutura do Projeto

```
app/
├── api/                    # Rotas da API Next.js
├── atoms/                  # Jotai atoms para estado global
├── components/             # Componentes React
│   ├── management/         # Componentes administrativos
│   ├── modal/             # Modais e diálogos
│   ├── subTab/            # Componentes de abas
│   └── ui/                # Componentes UI reutilizáveis
├── hooks/                  # Custom hooks
├── layout/                 # Layout principal da aplicação
├── lib/                    # Utilitários e configurações
├── schemas/               # Schemas de validação
└── types/                 # Definições TypeScript
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=your-api-endpoint
```

### Integração com API Externa

O sistema se conecta com a API externa da SEJUSP através de:
- Autenticação JWT
- Proxy através das rotas da API Next.js
- Gerenciamento automático de tokens

## 🏗️ Arquitetura

### Padrões Implementados

- **Atomic Design** para organização de componentes
- **Custom Hooks** para lógica de negócio
- **Proxy API Pattern** para integração externa
- **Role-Based Access Control** para autorização

### Fluxo de Dados

1. Componentes consomem custom hooks
2. Hooks gerenciam estado Jotai e chamadas API
3. Rotas API fazem proxy para API externa SEJUSP
4. Respostas atualizam atoms, triggering re-renders

## 📱 Funcionalidades

### Para Usuários
- Login e registro com aprovação
- Visualização de cadeiras disponíveis
- Agendamento de slots de tempo
- Histórico de agendamentos

### Para Atendentes/Admins
- Aprovação de novos usuários
- Gerenciamento de cadeiras e status
- Configuração de horários disponíveis
- Dashboard com métricas do sistema

## 🔒 Segurança

- Autenticação JWT segura
- Validação de entrada com Zod/Yup
- Proteção de rotas baseada em roles
- Sanitização de dados

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento da SEJUSP.

---

**Desenvolvido para SEJUSP - Secretaria de Estado de Justiça e Segurança Pública**