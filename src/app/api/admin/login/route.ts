import { NextRequest, NextResponse } from "next/server"
import { signAdminToken } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { log } from "@/lib/logger"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "unknown"
  if (!await checkRateLimit(`admin-login:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez dans une minute" }, { status: 429 })
  }

  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Identifiants requis" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || user.role !== "SUPERADMIN" || !user.passwordHash) {
    await log({ action: "ADMIN_LOGIN_FAILED", userEmail: email, ip })
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    await log({ action: "ADMIN_LOGIN_FAILED", userEmail: email, ip })
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
  }

  await log({ action: "ADMIN_LOGIN_SUCCESS", userId: user.id, userEmail: user.email, ip })
  const token = await signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  })
  return res
}
