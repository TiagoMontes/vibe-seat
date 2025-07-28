import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const API_BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface CustomSession {
  accessToken?: string;
  user?: {
    id: string;
    username?: string;
    role?: string;
    status?: string;
  };
}

export async function GET(
  request: Request,
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

    // Call backend API
    const backendResponse = await fetch(`${API_BACKEND}/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${(session as CustomSession).accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: "Erro desconhecido" }));
      return NextResponse.json(
        { 
          success: false,
          message: errorData.message 
        },
        { status: backendResponse.status }
      );
    }
    
    const responseData = await backendResponse.json();

    return NextResponse.json({
      success: true,
      message: "Dados do usuário carregados com sucesso",
      data: responseData
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

 