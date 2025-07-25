import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { decode } from 'jsonwebtoken';

interface LoginResponse {
  token: string;
  [key: string]: unknown;
}

interface DecodedToken {
  id?: number;
  username?: string;
  role?: string;
  exp?: number;
}

async function loginAPI(username: string, password: string): Promise<LoginResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro na autenticação: ${response.status}`);
    }

    const data: LoginResponse = await response.json();

    if (!data.token) {
      throw new Error('Token não recebido do servidor');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro de conexão com o servidor');
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username e password são obrigatórios');
        }

        try {
          const result = await loginAPI(credentials.username, credentials.password)

          if (result.token) {
            // Decodificar o token para extrair as informações do usuário
            const decodedToken = decode(result.token) as DecodedToken;

            return {
              id: decodedToken.id?.toString() || '1',
              username: decodedToken.username || credentials.username,
              role: decodedToken.role || 'User',
              token: result.token
            };
          }

          return null;
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Erro de autenticação');
        }
      }
    })
  ],

  secret: process.env.JWT_SECRET || 'your-secret-key',

  pages: {
    signIn: '/',
    signOut: '/',
    error: '/'
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        const decodedToken = decode(user.token) as DecodedToken;
        
        return {
          ...token,
          accessToken: user.token,
          id: user.id,
          username: user.username,
          role: user.role,
          exp: decodedToken.exp
        };
      }

      return token;
    },

    async session({ session, token }) {
      // Acessamos as propriedades diretamente sem conversão
      Object.assign(session, {
        accessToken: token.accessToken,
        expires: (token.exp as number) * 1000,
        expiresFormatted: new Date((token.exp as number) * 1000).toLocaleString('pt-BR')
      });
      
      // Atualizamos o objeto user
      Object.assign(session.user, {
        username: token.username,
        role: token.role,
        id: token.id
      });

      return session;
    }
  },

  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 horas
  },

  debug: process.env.NODE_ENV === 'development',
}; 