import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Dismiss one notification
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  await prisma.notification.updateMany({
    where: { id, companyId: session.user.companyId },
    data: { isRead: true },
  })
  return new NextResponse(null, { status: 204 })
}
