import { useCallback, useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { useToast } from "./useToast";
import { DashboardData } from "@/app/types/dashboard";
import { userAtom } from "@/app/atoms/userAtoms";

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAtom(userAtom);
  const { error: toastError } = useToast();
  
  // Ref para evitar re-renders desnecessários
  const hasLoadedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao carregar dashboard");
      }

      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
      hasLoadedRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toastError("Erro ao carregar dashboard: " + errorMessage);
      console.error("Error fetching dashboard:", err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [toastError]);

  // Carregamento inicial apenas uma vez
  useEffect(() => {
    if (!hasLoadedRef.current) {
      fetchDashboardData(true);
    }
  }, []); // Dependências vazias - executa apenas uma vez

  // Auto-refresh a cada 5 minutos (apenas após o carregamento inicial)
  useEffect(() => {
    if (hasLoadedRef.current) {
      intervalRef.current = setInterval(() => {
        fetchDashboardData(false); // Não mostrar loading no auto-refresh
      }, 5 * 60 * 1000); // 5 minutos

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [fetchDashboardData]);

  const refreshData = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refreshData,
    isAdmin: user?.role === "admin",
  };
}; 