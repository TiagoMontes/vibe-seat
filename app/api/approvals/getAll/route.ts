import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não encontrado' },
        { status: 401 }
      );
    }

    const apiUrl = process.env.API_BACKEND;
    
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'API_BACKEND não configurado no .env' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl}/approvals/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        'User-Agent': '*'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token inválido ou expirado' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `Erro ao buscar approvals: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar approvals:', error);
    return NextResponse.json(
      { error: 'Erro de conexão com o servidor' },
      { status: 500 }
    );
  }
} 