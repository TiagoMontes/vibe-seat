import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
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
    const limit = searchParams.get("limit") || "9";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("page", page);
    queryParams.set("limit", limit);
    if (search) queryParams.set("search", search);
    if (status && status !== "all") queryParams.set("status", status);
    queryParams.set("sortBy", sortBy);

    const response = await fetch(`${apiUrl}/chairs/?${queryParams.toString()}`, {
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
        { error: `Erro ao buscar cadeiras: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar cadeiras:", error);
    return NextResponse.json(
      { error: "Erro de conexão com o servidor" },
      { status: 500 }
    );
  }
} 