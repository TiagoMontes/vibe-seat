import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface UpdateApprovalBody {
  approvalId: number;
  status: 'approved' | 'rejected' | 'pending';
}

export async function PATCH(request: NextRequest) {
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

    const body: UpdateApprovalBody = await request.json();

    if (!body.approvalId || !body.status) {
      return NextResponse.json(
        { error: 'ApprovalId e status são obrigatórios' },
        { status: 400 }
      );
    }

    const response = await fetch(`${apiUrl}/approvals/${body.approvalId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        'User-Agent': '*'
      },
      body: JSON.stringify({
        status: body.status
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token inválido ou expirado' },
          { status: 401 }
        );
      }
      
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `Erro ao atualizar approval: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar approval:', error);
    return NextResponse.json(
      { error: 'Erro de conexão com o servidor' },
      { status: 500 }
    );
  }
} 