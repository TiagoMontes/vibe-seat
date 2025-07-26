# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `npm run dev` (uses Next.js with Turbopack)
- **Build**: `npm run build`
- **Production server**: `npm start`
- **Linting**: `npm run lint`

## Project Architecture

This is a **VibeSeat** appointment booking system built with Next.js 15 and the App Router. It's designed for SEJUSP (Secretaria de Estado de Justiça e Segurança Pública) to manage chair/seat appointments.

### Core Technologies
- **Framework**: Next.js 15 with App Router and Turbopack
- **Auth**: NextAuth.js with custom credentials provider + JWT
- **State Management**: Jotai for global state
- **Styling**: Tailwind CSS + Radix UI components
- **Forms**: React Hook Form with Yup/Zod validation
- **UI Components**: Custom shadcn/ui components

### Architecture Patterns

**State Management Structure:**
- **Atoms** (`app/atoms/`): Jotai atoms for global state (user, appointments, chairs, schedules)
- **Hooks** (`app/hooks/`): Custom hooks that interface with atoms and handle API calls
- **Components** consume hooks, not atoms directly

**API Structure:**
- All API routes follow REST patterns in `app/api/`
- Authentication handled via NextAuth with external API integration
- API expects JWT tokens for authenticated requests

**Component Organization:**
- **Management components** (`app/components/management/`): Admin/attendant interfaces
- **Modal components** (`app/components/modal/`): Popup dialogs and forms
- **SubTab components** (`app/components/subTab/`): Tab content components
- **UI components** (`app/components/ui/`): Reusable UI primitives

### Key Architectural Concepts

**Role-Based Access:**
- Three roles: `admin`, `attendant`, `user`
- Admin/attendant can access management features
- Users can only book appointments and view their own data
- Role checking implemented in layout components and API routes

**Authentication Flow:**
- Login page (`app/page.tsx`) handles both login and registration
- Authentication persisted via NextAuth sessions
- User data stored in Jotai atoms after successful auth
- Redirects to `/home` after authentication

**Appointment System:**
- Time-slot based booking system
- Chairs have different statuses (ACTIVE, MAINTENANCE, INACTIVE)
- Schedules define available time ranges and days
- Appointments can be SCHEDULED, CONFIRMED, or CANCELLED

**Data Flow Pattern:**
1. Components call custom hooks
2. Hooks manage Jotai atom state and make API calls
3. API routes interface with external SEJUSP API
4. Responses update atoms, triggering component re-renders

### Important Implementation Details

**External API Integration:**
- App communicates with external SEJUSP API via `NEXT_PUBLIC_API_URL`
- All data operations proxy through Next.js API routes
- JWT tokens passed to external API for authentication

**Time Management:**
- Uses `date-fns` for date operations
- Time slots are string-based ("HH:MM" format)
- Schedules have validity periods (validFrom/validTo dates)

**Mobile Responsiveness:**
- Layout component (`app/layout/index.tsx`) detects mobile and switches between sidebar and mobile menu
- Uses Tailwind responsive classes throughout

### Type Definitions
Comprehensive TypeScript interfaces defined in `app/types/api.ts` covering all API responses, requests, and data structures used throughout the application.