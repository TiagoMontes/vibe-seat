import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { decode } from 'jsonwebtoken';

async function loginAPI(username: string, password: string) {
  const apiUrl = process.env.API_BACKEND;
  
  if (!apiUrl) {
    throw new Error('API_BACKEND não configurado no .env');
  }

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '*'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na autenticação: ${response.status}`);
    }

    const data = await response.json();

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
            return {
              id: result.user?.id?.toString() || '1',
              name: result.user?.name || credentials.username,
              email: result.user?.email || `${credentials.username}@vibeseat.com`,
              role: result.user?.role || 'User',
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
    async jwt({ token, user, account }: any) {
      if (account && user) {
        const decodedToken = decode(user.token) as any;
        
        return {
          ...token,
          accessToken: user.token,
          id: user.id,
          role: user.role,
          username: user.username,
          exp: decodedToken.exp
        };
      }

      return token;
    },

    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.expires = token.exp * 1000;
      session.expiresFormatted = new Date(token.exp * 1000).toLocaleString('pt-BR');
      session.user.email = token.username;
      session.user.role = token.role;
      session.user.id = token.id;

      return session;
    }
  },

  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 horas
  },

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };