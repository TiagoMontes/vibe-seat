import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

// Mock de usuários para simular o backend
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Administrador',
    role: 'Admin',
    email: 'admin@vibeseat.com'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    name: 'Usuário Padrão',
    role: 'User',
    email: 'user@vibeseat.com'
  },
  {
    id: 3,
    username: 'manager',
    password: 'manager123',
    name: 'Gerente',
    role: 'Manager',
    email: 'manager@vibeseat.com'
  }
];

// Mock da API de login
async function mockLoginAPI(username: string, password: string) {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simular diferentes cenários de erro
  if (username === 'error') {
    throw new Error('Erro interno do servidor');
  }

  if (username === 'blocked') {
    throw new Error('Usuário bloqueado. Entre em contato com o suporte.');
  }

  if (username === 'invalid') {
    throw new Error('Credenciais inválidas');
  }

  // Buscar usuário mockado
  const user = mockUsers.find(u => u.username === username && u.password === password);

  if (!user) {
    throw new Error('Username ou senha incorretos');
  }

  // Simular token JWT
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    },
    process.env.JWT_SECRET || 'your-secret-key'
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    }
  };
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
          const result = await mockLoginAPI(credentials.username, credentials.password);

          if (result.token) {
            return {
              id: result.user.id.toString(),
              name: result.user.name,
              email: result.user.email,
              role: result.user.role,
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
        const decodedToken = jwt.decode(user.token) as any;
        
        return {
          ...token,
          accessToken: user.token,
          id: user.id,
          role: user.role,
          username: user.email, // Usando email como username
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