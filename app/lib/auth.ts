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

interface DecodedUser {
  id: number;
  username: string;
  role: string;
  status: string;
}

interface CustomUser {
  id: string;
  username: string;
  role: string;
  status: string;
  token: string;
}

interface CustomToken {
  accessToken?: string;
  id?: string;
  username?: string;
  role?: string;
  status?: string;
  [key: string]: unknown;
}

async function loginAPI(username: string, password: string): Promise<LoginResponse> {
  // Usar a URL da API configurada no ambiente
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.100.210:3001';

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
        errorMessage = errorData.error || errorMessage;
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
      type: 'credentials',
      credentials: {
        username: { 
          label: 'Username', 
          type: 'text',
          placeholder: 'Digite seu usuário'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Digite sua senha'
        }
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          const result = await loginAPI(credentials.username, credentials.password);

          if (result.token) {
            const decoded = decode(result.token) as DecodedUser;

            const user: CustomUser = {
              id: decoded.id.toString(),
              username: decoded.username,
              role: decoded.role,
              status: decoded.status,
              token: result.token
            };

            return user;
          }

          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          // Não fazer throw aqui para evitar redirect para callback
          return null;
        }
      }
    })
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/',
    error: '/',
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        const customUser = user as CustomUser;
        return {
          ...token,
          accessToken: customUser.token,
          id: customUser.id,
          username: customUser.username,
          role: customUser.role,
          status: customUser.status,
        } as CustomToken;
      }

      return token;
    },

    async session({ session, token }) {
      const customToken = token as CustomToken;
      return {
        ...session,
        accessToken: customToken.accessToken,
        user: {
          ...session.user,
          id: customToken.id,
          username: customToken.username,
          role: customToken.role,
          status: customToken.status,
        }
      };
    },

    async redirect({ url, baseUrl }) {
      // Se for uma URL relativa, usar baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Se for a mesma origem, permitir
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // Por padrão, redirecionar para home
      return baseUrl;
    }
  },

  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 horas
  },

  debug: process.env.NODE_ENV === 'development',
  
  // Configurações adicionais para Windows
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};