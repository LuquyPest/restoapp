import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAuthorityRole, authorityZone } from "@/lib/authority"
import type { UserRole } from "@prisma/client"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const role = session.user.role
  if (!isAuthorityRole(role)) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { companyId } = await params
  const zone = authorityZone(role)
  const company = await prisma.company.findFirst({ where: { id: companyId, ...(zone ? { mairieZone: zone } : {}) } })
  if (!company) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.authorityMessage.updateMany({
    where: { companyId, authorityRole: role as UserRole, readByAuthorityAt: null },
    data: { readByAuthorityAt: new Date() },
  })

  await prisma.notification.updateMany({
    where: {
      companyId, type: "AUTHORITY_MESSAGE", recipientUserId: session.user.id,
      entityId: { startsWith: `authmsg:${companyId}:${role}:` },
    },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}
