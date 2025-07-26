import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { decode } from 'jsonwebtoken';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
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
      let errorMessage = `Erro na autenticação: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.message || errorMessage;
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data: LoginResponse = await response.json();

    if (!data.token) {
      throw new Error('Token não recebido do servidor');
    }

    return data;
  } catch (error) {
    console.error('Login API Error:', error);
    
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
          const result = await loginAPI(credentials.username, credentials.password);

          if (result.token) {
            const user = decode(result.token) as { id: number, username: string, role: string };
            return {
              id: user.id.toString(), // Convert to string
              username: user.username,
              role: user.role,
              token: result.token
            };
          }

          return null;
        } catch (error) {
          console.error('Authorization error:', error);
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
        return {
          ...token,
          accessToken: user.token,
          id: user.id,
          username: user.username,
          role: user.role,
        };
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          role: token.role,
        }
      };
    }
  },

  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 horas
  },

  debug: process.env.NODE_ENV === 'development',
}; 