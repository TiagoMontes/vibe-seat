import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken || !session?.user) {
      return NextResponse.json(
        { error: "Token de acesso não encontrado" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "9";

    if (!date) {
      return NextResponse.json(
        { error: "date é obrigatório" },
        { status: 400 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("date", date);
    queryParams.set("page", page);
    queryParams.set("limit", limit);

    const response = await fetch(`${apiUrl}/appointments/available-times?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
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
        { error: errorData.error || `Erro ao buscar horários disponíveis: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error);
    return NextResponse.json(
      { error: "Erro de conexão com o servidor" },
      { status: 500 }
    );
  }
} 