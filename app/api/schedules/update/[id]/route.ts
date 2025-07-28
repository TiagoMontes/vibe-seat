import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const API_BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function PATCH(
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
        { error: "Acesso negado. Apenas administradores podem atualizar horários." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Call backend API
    const backendResponse = await fetch(`${API_BACKEND}/schedules/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
        "User-Agent": "Vibe-Seat-Frontend/1.0",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      let errorData;
      try {
        errorData = await backendResponse.json();
      } catch (parseError) {
        errorData = { error: "Erro desconhecido", status: backendResponse.status };
      }

      return NextResponse.json(
        { 
          error: errorData.message || errorData.error || "Erro ao atualizar configuração",
          details: errorData,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const updatedSchedule = await backendResponse.json();
    
    return NextResponse.json(
      { 
        success: true, 
        data: updatedSchedule,
        message: "Configuração atualizada com sucesso"
      }, 
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}

 