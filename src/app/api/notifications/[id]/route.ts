import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAuthorityRole } from "@/lib/authority"

// Dismiss one notification
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const where = isAuthorityRole(session.user.role)
    ? { id, recipientUserId: session.user.id }
    : {
        id, companyId: session.user.companyId,
        OR: [{ recipientUserId: null }, { recipientUserId: session.user.id }],
      }

  await prisma.notification.updateMany({ where, data: { isRead: true } })
  return new NextResponse(null, { status: 204 })
}
