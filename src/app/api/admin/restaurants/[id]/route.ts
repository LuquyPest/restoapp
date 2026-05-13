import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params

  const restaurant = await prisma.restaurant.findUnique({ where: { id } })
  if (!restaurant) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  // Delete in correct order to respect foreign key constraints
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

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.currency && { currency: body.currency }),
    },
  })
  return NextResponse.json(restaurant)
}
