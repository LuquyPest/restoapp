import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"

const patchSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Statut invalide" }, { status: 400 })

  const order = await prisma.order.findFirst({ where: { id, restaurantId } })
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })

  const updated = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } })

  if (parsed.data.status === "CANCELLED") {
    await log({
      action: "ORDER_CANCELLED",
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      restaurantId,
      ip: getIp(req.headers),
      metadata: { orderId: id, total: order.total },
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: { id, restaurantId },
    include: { lines: true },
  })
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })

  // Restore stock: reverse the same recipe-based deduction done at creation
  const menuItemIds = order.lines.map(l => l.menuItemId)
  if (menuItemIds.length > 0) {
    const recipeLines = await prisma.recipeLine.findMany({
      where: { menuItemId: { in: menuItemIds } },
    })
    if (recipeLines.length > 0) {
      const restorations = new Map<string, number>()
      for (const orderLine of order.lines) {
        for (const r of recipeLines.filter(r => r.menuItemId === orderLine.menuItemId)) {
          restorations.set(r.ingredientId, (restorations.get(r.ingredientId) ?? 0) + r.quantity * orderLine.quantity)
        }
      }
      await Promise.all(
        Array.from(restorations.entries()).map(([ingredientId, qty]) =>
          prisma.ingredient.update({ where: { id: ingredientId }, data: { quantity: { increment: qty } } })
        )
      )
    }
  }

  await prisma.order.delete({ where: { id } })

  await log({
    action: "ORDER_DELETED",
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    restaurantId,
    ip: getIp(req.headers),
    metadata: { orderId: id, total: order.total },
  })

  return NextResponse.json({ success: true })
}
