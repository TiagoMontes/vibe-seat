import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Token de acesso não encontrado" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const body = await request.json();
    const { id } = await params;

    const response = await fetch(`${apiUrl}/chairs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Token inválido ou expirado" },
          { status: 401 }
        );
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      return NextResponse.json(
        { error: errorData.error || "Erro ao atualizar cadeira" },
        { status: response.status }
      );
    }

    const chair = await response.json();
    return NextResponse.json(chair);
  } catch (error) {
    console.error("Erro ao atualizar cadeira:", error);
    return NextResponse.json(
      { error: "Erro de conexão com o servidor" },
      { status: 500 }
    );
  }
} 