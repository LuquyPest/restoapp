import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params

  const restaurant = await prisma.restaurant.findUnique({ where: { id } })
  if (!restaurant) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.orderLine.deleteMany({ where: { order: { restaurantId: id } } })
  await prisma.order.deleteMany({ where: { restaurantId: id } })
  await prisma.payroll.deleteMany({ where: { restaurantId: id } })
  await prisma.weeklyReport.deleteMany({ where: { restaurantId: id } })
  await prisma.invoice.deleteMany({ where: { restaurantId: id } })
  await prisma.supplier.deleteMany({ where: { restaurantId: id } })
  await prisma.charge.deleteMany({ where: { restaurantId: id } })
  await prisma.loyaltyCard.deleteMany({ where: { restaurantId: id } })
  await prisma.partner.deleteMany({ where: { restaurantId: id } })
  await prisma.employee.deleteMany({ where: { restaurantId: id } })
  await prisma.grade.deleteMany({ where: { restaurantId: id } })
  await prisma.menuItem.deleteMany({ where: { restaurantId: id } })
  await prisma.user.deleteMany({ where: { restaurantId: id } })
  await prisma.restaurant.delete({ where: { id } })

  await log({
    action: "RESTAURANT_DELETED",
    ip: getIp(req.headers),
    metadata: { restaurantId: id, restaurantName: restaurant.name },
  })
  return NextResponse.json({ ok: true })
}

const patchSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  currency: z.string().min(1).max(5).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.currency && { currency: parsed.data.currency }),
    },
  })
  return NextResponse.json(restaurant)
}
