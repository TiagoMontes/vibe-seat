import { NextRequest, NextResponse } from 'next/server';

interface CreateUserBody {
  username: string;
  password: string;
  roleId: number;
  fullName: string;
  cpf: string;
  jobFunction: string;
  position: string;
  registration: string;
  sector: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const body: CreateUserBody = await request.json();

    // Validações básicas
    if (!body.username || !body.password || !body.roleId) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Username, password e roleId são obrigatórios',
          error: true
        },
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
        roleId: body.roleId,
        fullName: body.fullName,
        cpf: body.cpf,
        jobFunction: body.jobFunction,
        position: body.position,
        registration: body.registration,
        sector: body.sector,
        email: body.email,
        phone: body.phone,
        gender: body.gender,
        birthDate: body.birthDate
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false,
          message: responseData.message || `Erro ao criar usuário: ${response.status}`,
          error: true
        },
        { status: response.status }
      );
    }

    // Se chegou aqui, foi sucesso
    return NextResponse.json({
      success: true,
      message: responseData.message || "Usuário criado com sucesso. Aguarde aprovação.",
      data: responseData.data
    });
    
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro de conexão com o servidor',
        error: true
      },
      { status: 500 }
    );
  }
} 