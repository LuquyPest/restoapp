import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAuthorityRole } from "@/lib/authority"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  // Les comptes autorité (IRS/Mairie) n'ont pas de companyId — leurs notifs
  // sont personnelles et couvrent plusieurs entreprises différentes.
  const where = isAuthorityRole(session.user.role)
    ? { recipientUserId: session.user.id, isRead: false }
    : {
        companyId: session.user.companyId, isRead: false,
        OR: [{ recipientUserId: null }, { recipientUserId: session.user.id }],
      }

  const notifications = await prisma.notification.findMany({ where, orderBy: { createdAt: "desc" } })
  return NextResponse.json(notifications)
}

// Mark all as read (dismiss all)
export async function PATCH() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const where = isAuthorityRole(session.user.role)
    ? { recipientUserId: session.user.id, isRead: false }
    : {
        companyId: session.user.companyId, isRead: false,
        OR: [{ recipientUserId: null }, { recipientUserId: session.user.id }],
      }

  await prisma.notification.updateMany({ where, data: { isRead: true } })
  return NextResponse.json({ ok: true })
}
