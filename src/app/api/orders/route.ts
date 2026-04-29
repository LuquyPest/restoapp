import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  lines: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    costPrice: z.number().min(0),
  })).min(1),
  note: z.string().optional(),
  partnerId: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { restaurantId } = session.user

  // Find or create employee record for non-employee roles (owner/manager taking orders)
  let employee = await prisma.employee.findFirst({ where: { userId: session.user.id } })
  
  if (!employee) {
    // Create a virtual employee record for owner/manager
    const grade = await prisma.grade.findFirst({ where: { restaurantId } })
    if (!grade) return NextResponse.json({ error: "Aucun grade configuré" }, { status: 400 })
    employee = await prisma.employee.create({
      data: {
        userId: session.user.id,
        restaurantId,
        gradeId: grade.id,
        firstName: session.user.name?.split(" ")[0] ?? "Patron",
        lastName: session.user.name?.split(" ").slice(1).join(" ") ?? "",
      },
    })
  }

  let discountAmount = 0
  let partner = null

  if (parsed.data.partnerId) {
    partner = await prisma.partner.findFirst({
      where: { id: parsed.data.partnerId, restaurantId, isActive: true },
    })
    if (partner) {
      const subtotal = parsed.data.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
      discountAmount = subtotal * (partner.discountPercent / 100)
    }
  }

  const subtotal = parsed.data.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
  const total = Math.max(0, subtotal - discountAmount)

  const order = await prisma.order.create({
    data: {
      restaurantId,
      employeeId: employee.id,
      partnerId: partner?.id ?? null,
      total,
      discountAmount,
      status: "CONFIRMED",
      note: parsed.data.note,
      lines: {
        create: parsed.data.lines.map(l => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          costPrice: l.costPrice,
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
    include: { employee: true, lines: { include: { menuItem: true } }, partner: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(orders)
}
