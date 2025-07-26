"use client";

import { useUserData } from '@/app/hooks/useUserData';

export const UserDataSync = () => {
  useUserData(); // Sincroniza automaticamente os dados da sessão com o userAtom
  return null; // Componente invisible que apenas executa a sincronização
};