import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

function getISOWeek(d: Date) {
  const date = new Date(d); date.setHours(0,0,0,0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

const createSchema = z.object({
  lines: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
  note: z.string().max(500).optional(),
  partnerId: z.string().optional().nullable(),
  loyaltyCardId: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { restaurantId } = session.user
  const now = new Date()
  const weekNumber = getISOWeek(now)
  const year = now.getFullYear()

  // Fetch prices from DB — never trust client-supplied prices
  const menuItemIds = parsed.data.lines.map(l => l.menuItemId)
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, restaurantId, isAvailable: true },
  })
  if (menuItems.length !== menuItemIds.length) {
    return NextResponse.json({ error: "Article introuvable ou indisponible" }, { status: 404 })
  }
  const priceMap = new Map(menuItems.map(m => [m.id, m]))

  let employee = await prisma.employee.findFirst({ where: { userId: session.user.id } })
  if (!employee) {
    const grade = await prisma.grade.findFirst({ where: { restaurantId } })
    if (!grade) return NextResponse.json({ error: "Aucun grade configuré" }, { status: 400 })
    employee = await prisma.employee.create({
      data: {
        userId: session.user.id, restaurantId, gradeId: grade.id,
        firstName: session.user.name?.split(" ")[0] ?? "Patron",
        lastName: session.user.name?.split(" ").slice(1).join(" ") ?? "",
      },
    })
  }

  const subtotal = parsed.data.lines.reduce((s, l) => s + priceMap.get(l.menuItemId)!.price * l.quantity, 0)

  // Get partner discount
  let partnerDiscount = 0
  let partner = null
  if (parsed.data.partnerId) {
    partner = await prisma.partner.findFirst({ where: { id: parsed.data.partnerId, restaurantId, isActive: true } })
    if (partner) partnerDiscount = partner.discountPercent
  }

  // Get loyalty card discount
  let loyaltyDiscount = 0
  let loyaltyCard = null
  if (parsed.data.loyaltyCardId) {
    loyaltyCard = await prisma.loyaltyCard.findFirst({
      where: { id: parsed.data.loyaltyCardId, restaurantId, isActive: true, expiresAt: { gte: now } },
    })
    if (loyaltyCard) loyaltyDiscount = loyaltyCard.discountPercent
  }

  // Apply best discount (not cumulative)
  const discountPercent = Math.max(partnerDiscount, loyaltyDiscount)
  const discountAmount = subtotal * (discountPercent / 100)
  const total = Math.max(0, subtotal - discountAmount)

  const order = await prisma.order.create({
    data: {
      restaurantId, employeeId: employee.id,
      partnerId: partner?.id ?? null,
      loyaltyCardId: loyaltyCard?.id ?? null,
      total, discountAmount,
      status: "CONFIRMED",
      note: parsed.data.note,
      weekNumber, year,
      lines: {
        create: parsed.data.lines.map(l => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          unitPrice: priceMap.get(l.menuItemId)!.price,
          costPrice: priceMap.get(l.menuItemId)!.costPrice,
        })),
      },
    },
  })

  return NextResponse.json(order, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { restaurantId, role } = session.user

  const where = role === "EMPLOYEE"
    ? { restaurantId, employee: { userId: session.user.id } }
    : { restaurantId }

  const orders = await prisma.order.findMany({
    where,
    include: {
      employee: { select: { id: true, firstName: true, lastName: true } },
      lines: { include: { menuItem: true } },
      partner: true,
      loyaltyCard: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })
  return NextResponse.json(orders)
}
