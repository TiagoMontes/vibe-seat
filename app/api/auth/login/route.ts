import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e password são obrigatórios' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || `Erro na autenticação: ${response.status}` },
        { status: response.status }
      );
    }

    if (!data.token) {
      return NextResponse.json(
        { error: 'Token não recebido do servidor' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error('Login API Error:', error);
    
    return NextResponse.json(
      { error: 'Erro de conexão com o servidor' },
      { status: 500 }
    );
  }
}