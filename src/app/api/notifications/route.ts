import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { restaurantId: session.user.restaurantId, isRead: false },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(notifications)
}

// Mark all as read (dismiss all)
export async function PATCH() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  await prisma.notification.updateMany({
    where: { restaurantId: session.user.restaurantId, isRead: false },
    data: { isRead: true },
  })
  return NextResponse.json({ ok: true })
}
