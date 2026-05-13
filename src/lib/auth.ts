import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = (req as any)?.headers?.["x-forwarded-for"]?.split(",")[0].trim()
          ?? (req as any)?.headers?.["x-real-ip"]
          ?? "unknown"

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { restaurant: true },
        })

        if (!user || !user.passwordHash || user.role === "SUPERADMIN") {
          log({ action: "LOGIN_FAILED", userEmail: parsed.data.email, ip })
          return null
        }

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!isValid) {
          log({ action: "LOGIN_FAILED", userEmail: parsed.data.email, ip })
          return null
        }

        log({
          action: "LOGIN_SUCCESS",
          userId: user.id,
          userEmail: user.email,
          restaurantId: user.restaurantId ?? undefined,
          ip,
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.restaurantId = (user as any).restaurantId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.restaurantId = token.restaurantId as string
      }
      return session
    },
  },
})
