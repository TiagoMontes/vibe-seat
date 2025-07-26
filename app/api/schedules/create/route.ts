import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const API_BACKEND = process.env.API_BACKEND || "http://localhost:3001";

export async function POST(request: NextRequest) {
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
        { error: "Acesso negado. Apenas administradores podem gerenciar horários." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Call backend API
    const backendResponse = await fetch(`${API_BACKEND}/schedules/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Erro desconhecido" }));
      return NextResponse.json(
        { error: errorData.message || errorData.message || "Erro ao criar configuração" },
        { status: backendResponse.status }
      );
    }

    const schedules = await backendResponse.json();
    return NextResponse.json(schedules, { status: 201 });

  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

 