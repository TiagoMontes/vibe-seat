import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const API_BACKEND = process.env.API_BACKEND || "http://localhost:3001";

export async function DELETE(request: NextRequest) {
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
        { error: "Acesso negado. Apenas administradores podem excluir horários." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    // Validate IDs array
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "IDs são obrigatórios e devem ser um array não vazio" },
        { status: 400 }
      );
    }

    // Validate that all IDs are numbers
    const invalidIds = ids.filter((id: unknown) => typeof id !== 'number' || isNaN(id as number));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Todos os IDs devem ser números válidos" },
        { status: 400 }
      );
    }

    // Call backend API
    const backendResponse = await fetch(`${API_BACKEND}/schedules/bulk-delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ ids }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Erro desconhecido" }));
      return NextResponse.json(
        { error: errorData.message || errorData.message || "Erro ao excluir configurações" },
        { status: backendResponse.status }
      );
    }

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("Error bulk deleting schedules:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 