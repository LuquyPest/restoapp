import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({ password: z.string().min(6) })

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Mot de passe trop court (min. 6 caractères)" }, { status: 400 })

  const employee = await prisma.employee.findFirst({ where: { id, restaurantId } })
  if (!employee) return NextResponse.json({ error: "Employé introuvable" }, { status: 404 })

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  await prisma.user.update({ where: { id: employee.userId }, data: { passwordHash } })

  await log({
    action: "PASSWORD_RESET",
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    restaurantId: restaurantId ?? undefined,
    ip: getIp(req.headers),
    metadata: { targetEmployeeId: id },
  })

  return NextResponse.json({ ok: true })
}
