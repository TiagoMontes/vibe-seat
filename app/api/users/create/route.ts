import { NextRequest, NextResponse } from 'next/server';

interface CreateUserBody {
  username: string;
  password: string;
  roleId: number;
}

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const body: CreateUserBody = await request.json();

    // Validações básicas
    if (!body.username || !body.password || !body.roleId) {
      return NextResponse.json(
        { error: 'Username, password e roleId são obrigatórios' },
        { status: 400 }
      );
    }

    const response = await fetch(`${apiUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
        roleId: body.roleId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      return NextResponse.json(
        { error: errorData.error || `Erro ao criar usuário: ${response.status}` },
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