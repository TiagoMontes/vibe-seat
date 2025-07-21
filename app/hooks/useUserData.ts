"use client";

import { useAtomValue } from 'jotai';
import { 
  userAtom, 
  userNameAtom, 
  userRoleAtom, 
  userIdAtom,
  isAuthenticatedAtom 
} from '@/app/atoms/userAtoms';

export function useUserData() {
  const user = useAtomValue(userAtom);
  const userName = useAtomValue(userNameAtom);
  const userRole = useAtomValue(userRoleAtom);
  const userId = useAtomValue(userIdAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  return {
    user,
    userName,
    userRole,
    userId,
    isAuthenticated,
  };
} 