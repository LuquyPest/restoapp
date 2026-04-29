import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  lines: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
  note: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id, restaurantId: session.user.restaurantId },
  })
  if (!employee) return NextResponse.json({ error: "Employé introuvable" }, { status: 403 })

  const total = parsed.data.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)

  const order = await prisma.order.create({
    data: {
      restaurantId: session.user.restaurantId,
      employeeId: employee.id,
      total,
      status: "CONFIRMED",
      note: parsed.data.note,
      lines: {
        create: parsed.data.lines.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
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
    include: { employee: true, lines: { include: { menuItem: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(orders)
}
