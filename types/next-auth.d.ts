import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      username: string;
      role: string;
      status: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    username: string;
    role: string;
    status: string;
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    username?: string;
    role?: string;
    status?: string;
  }
}