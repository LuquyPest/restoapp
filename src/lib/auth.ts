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

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 2 * 60 * 60 },
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
          include: { company: true },
        })

        if (!user || !user.passwordHash || user.role === "SUPERADMIN") {
          await log({ action: "LOGIN_FAILED", userEmail: parsed.data.email, ip })
          return null
        }

        // Account lockout check
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await log({ action: "LOGIN_FAILED", userEmail: parsed.data.email, ip,
            metadata: { reason: "account_locked" } })
          return null
        }

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!isValid) {
          const newCount = (user.failedLoginAttempts ?? 0) + 1
          const lockUntil = newCount >= MAX_FAILED_ATTEMPTS
            ? new Date(Date.now() + LOCKOUT_DURATION_MS)
            : null
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newCount,
              ...(lockUntil && { lockedUntil: lockUntil }),
            },
          })
          await log({ action: "LOGIN_FAILED", userEmail: parsed.data.email, ip,
            metadata: { attempts: newCount } })
          return null
        }

        // Reset lockout on success
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        })

        await log({
          action: "LOGIN_SUCCESS",
          userId: user.id,
          userEmail: user.email,
          companyId: user.companyId ?? undefined,
          ip,
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          authorityReadOnly: user.authorityReadOnly,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.companyId = (user as any).companyId
        token.authorityReadOnly = (user as any).authorityReadOnly
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.authorityReadOnly = token.authorityReadOnly as boolean
      }
      return session
    },
  },
  events: {
    async signOut(message) {
      const token = (message as any).token
      if (token?.sub) {
        log({
          action: "LOGOUT",
          userId: token.sub,
          userEmail: token.email ?? undefined,
          companyId: token.companyId ?? undefined,
        })
      }
    },
  },
})
