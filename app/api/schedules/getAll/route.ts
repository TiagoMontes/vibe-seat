import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const API_BACKEND = process.env.API_BACKEND || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem visualizar horários." },
        { status: 403 }
      );
    }

    // Call backend API
    const backendResponse = await fetch(`${API_BACKEND}/schedules/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Erro desconhecido" }));
      return NextResponse.json(
        { error: errorData.error || errorData.message || "Erro ao buscar configurações" },
        { status: backendResponse.status }
      );
    }

    const schedules = await backendResponse.json();
    return NextResponse.json(schedules, { status: 200 });

  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 