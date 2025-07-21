import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    expires?: number
    expiresFormatted?: string
    user: {
      id?: string
      username?: string
      role?: string
    }
  }

  interface User {
    id: string
    username: string
    role: string
    token: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    id?: string
    role?: string
    username?: string
    exp?: number
  }
} 