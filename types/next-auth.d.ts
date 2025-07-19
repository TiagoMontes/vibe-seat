import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    expires?: number
    expiresFormatted?: string
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
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