'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import { Button } from '../components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  userName = "Usuário",
  userRole = "Admin",
  onLogout,
}) => {
  return (
    <div className={cn('min-h-screen bg-background flex', className)}>
      {/* Sidebar */}
      <aside className="flex flex-col max-w-[300px] w-full shadow-lg">
        
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-gray-300">
          <h1 className="text-xl font-bold text-foreground">Vibe Seat</h1>
        </div>

        {/* Menu de Opções */}
        <nav className="flex flex-col h-full p-4">
					{Array.from({ length: 10 }).map((_, index) => (
						<button key={index} className="cursor-pointer hover:bg-green-400 w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
							Opção {index + 1}
						</button>
					))}
        </nav>

        {/* Área do Usuário */}
        <div className="p-4 border-t border-gray-300 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userRole}
              </p>
            </div>
          </div>
          
          <Button
            onClick={onLogout}
            className="flex"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
