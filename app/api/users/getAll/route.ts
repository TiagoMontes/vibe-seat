import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extrair parâmetros de query
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '9';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const roleId = searchParams.get('roleId') || '';
  
  // Construir URL com parâmetros
  const queryParams = new URLSearchParams();
  queryParams.set('page', page);
  queryParams.set('limit', limit);
  
  if (status) {
    queryParams.set('status', status);
  }
  
  if (search) {
    queryParams.set('search', search);
  }
  
  if (sortBy !== 'newest') {
    queryParams.set('sortBy', sortBy);
  }

  if (roleId) {
    queryParams.set('roleId', roleId);
  }
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não encontrado' },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${apiUrl}/users?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token inválido ou expirado' },
          { status: 401 }
        );
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      return NextResponse.json(
        { error: errorData.message || `Erro ao buscar usuários: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro de conexão com o servidor' },
      { status: 500 }
    );
  }
} 