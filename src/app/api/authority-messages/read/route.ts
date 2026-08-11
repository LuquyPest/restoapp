import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AUTHORITY_ROLES } from "@/lib/authority"
import { z } from "zod"
import type { UserRole } from "@prisma/client"

const schema = z.object({ role: z.enum(AUTHORITY_ROLES) })

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  await prisma.authorityMessage.updateMany({
    where: { companyId: session.user.companyId, authorityRole: parsed.data.role as UserRole, readByCompanyAt: null },
    data: { readByCompanyAt: new Date() },
  })

  const companyId = session.user.companyId!
  await prisma.notification.updateMany({
    where: {
      companyId, type: "AUTHORITY_MESSAGE_RECEIVED", recipientUserId: session.user.id,
      entityId: { startsWith: `authmsgto:${companyId}:${parsed.data.role}:` },
    },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}
