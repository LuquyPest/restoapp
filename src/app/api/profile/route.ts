import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  phone: z.string().max(30).optional(),
  accountNumber: z.string().max(50).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { phone, accountNumber, currentPassword, newPassword } = parsed.data

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Mot de passe actuel requis" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 })
    const hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: hash } })
    await log({
      action: "PASSWORD_CHANGED",
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      companyId: session.user.companyId ?? undefined,
      ip: getIp(req.headers),
    })
  }

  const employee = await prisma.employee.findFirst({ where: { userId: session.user.id } })
  if (employee) {
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        ...(phone !== undefined && { phone }),
        ...(accountNumber !== undefined && { accountNumber }),
      },
    })
  }

  return NextResponse.json({ ok: true })
}
