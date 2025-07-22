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

    const apiUrl = process.env.API_BACKEND;
    
    if (!apiUrl) {
      return NextResponse.json(
        { error: "API_BACKEND não configurado no .env" },
        { status: 500 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status") || "";

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("page", page);
    queryParams.set("limit", limit);
    if (status && status !== "all") queryParams.set("status", status);

    const response = await fetch(`${apiUrl}/appointments/?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
        "User-Agent": "*"
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Token inválido ou expirado" },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `Erro ao buscar agendamentos: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Garante que o frontend sempre recebe o formato esperado
    return NextResponse.json({
      appointments: Array.isArray(data) ? data : data.appointments ?? [],
      pagination: data.pagination ?? {
        currentPage: parseInt(page),
        totalPages: 1,
        totalItems: Array.isArray(data) ? data.length : (data.appointments?.length ?? 0),
        itemsPerPage: parseInt(limit),
        hasNextPage: false,
        hasPrevPage: false,
      }
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro de conexão com o servidor" },
      { status: 500 }
    );
  }
} 