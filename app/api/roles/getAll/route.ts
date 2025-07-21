import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.API_BACKEND;
    
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'API_BACKEND não configurado no .env' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl}/roles/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '*'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao buscar roles: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar roles:', error);
    return NextResponse.json(
      { error: 'Erro de conexão com o servidor' },
      { status: 500 }
    );
  }
} 