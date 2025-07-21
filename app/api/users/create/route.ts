import { NextRequest, NextResponse } from 'next/server';

interface CreateUserBody {
  username: string;
  password: string;
  roleId: number;
}

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.API_BACKEND;
    
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'API_BACKEND não configurado no .env' },
        { status: 500 }
      );
    }

    const body: CreateUserBody = await request.json();

    // Validações básicas
    if (!body.username || !body.password || !body.roleId) {
      return NextResponse.json(
        { error: 'Username, password e roleId são obrigatórios' },
        { status: 400 }
      );
    }

    const response = await fetch(`${apiUrl}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '*'
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
        roleId: body.roleId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Erro ao criar usuário: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro de conexão com o servidor' },
      { status: 500 }
    );
  }
} 