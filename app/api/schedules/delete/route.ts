import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const API_BACKEND = process.env.API_BACKEND || "http://localhost:3001";

export async function DELETE() {
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
        { error: "Acesso negado. Apenas administradores podem remover horários." },
        { status: 403 } 
      );
    }

    // Call backend API
    const backendResponse = await fetch(`${API_BACKEND}/schedules`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Erro desconhecido" }));
      return NextResponse.json(
        { 
          success: false,
          message: errorData.error || errorData.message || "Erro ao excluir configuração" 
        },
        { status: backendResponse.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Configuração excluída com sucesso",
      data: null
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Erro interno do servidor" 
      },
      { status: 500 }
    );
  }
}

 