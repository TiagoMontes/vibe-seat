import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const API_BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    const backendResponse = await fetch(`${API_BACKEND}/schedules/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
        "User-Agent": "Vibe-Seat-Frontend/1.0",
        "Accept": "application/json",
      },
    });

    if (!backendResponse.ok) {
      let errorData;
      try {
        errorData = await backendResponse.json();
      } catch {
        errorData = { error: "Erro desconhecido", status: backendResponse.status };
      }

      return NextResponse.json(
        { 
          success: false,
          message: errorData.message || errorData.error || "Erro ao excluir configuração",
          details: errorData,
          status: backendResponse.status
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
    return NextResponse.json(
      { 
        success: false,
        message: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}

 