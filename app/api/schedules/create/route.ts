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
    
    console.log("Enviando dados para o backend:", JSON.stringify(body, null, 2));

    // Call backend API
    const backendResponse = await fetch(`${API_BACKEND}/schedules/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    console.log("Status da resposta do backend:", backendResponse.status);
    console.log("Headers da resposta:", Object.fromEntries(backendResponse.headers.entries()));

    if (!backendResponse.ok) {
      let errorData;
      try {
        errorData = await backendResponse.json();
        console.log("Erro detalhado do backend:", JSON.stringify(errorData, null, 2));
      } catch (parseError) {
        console.log("Erro ao fazer parse da resposta de erro:", parseError);
        errorData = { error: "Erro desconhecido", status: backendResponse.status };
      }

      // Retorna o erro exato do backend
      return NextResponse.json(
        { 
          error: errorData.message || errorData.error || "Erro ao criar configuração",
          details: errorData,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const schedules = await backendResponse.json();
    console.log("Resposta de sucesso do backend:", JSON.stringify(schedules, null, 2));
    
    return NextResponse.json(
      { 
        success: true, 
        data: schedules,
        message: "Configuração criada com sucesso"
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Erro interno ao criar schedule:", error);
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}

 