import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extrair parâmetros de query
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '8';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  
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

    const response = await fetch(`${apiUrl}/users/?${queryParams.toString()}`, {
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
        { error: `Erro ao buscar usuários: ${response.status}` },
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