import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const response = await fetch(`${apiUrl}/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      return NextResponse.json(
        { error: errorData.error || `Erro ao buscar roles: ${response.status}` },
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