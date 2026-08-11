import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getISOWeek } from "@/lib/utils"
import { resolveOrderPricing } from "@/lib/order-pricing"
import { deductOrderStock } from "@/lib/order-stock"
import { getOrCreateOrderEmployee } from "@/lib/order-employee"

const TICKET_INCLUDE = {
  employee: { select: { id: true, firstName: true, lastName: true } },
  claimedBy: { select: { id: true, firstName: true, lastName: true } },
  closedBy: { select: { id: true, firstName: true, lastName: true } },
  lines: { include: { menuItem: true } },
  partner: true,
  loyaltyCard: true,
} as const

const createSchema = z.object({
  lines: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
  customerName: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
  partnerId: z.string().optional().nullable(),
  loyaltyCardId: z.string().optional().nullable(),
  customAdjustmentType: z.enum(["PERCENT", "FIXED"]).optional().nullable(),
  customAdjustmentValue: z.number().min(-100000).max(100000).optional().nullable(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { companyId } = session.user

  const company = await prisma.company.findUnique({ where: { id: companyId! }, select: { type: true } })
  if (company?.type !== "RESTO_BAR") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  let employee
  try {
    employee = await getOrCreateOrderEmployee(session)
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erreur" }, { status: 400 })
  }

  let pricing
  try {
    pricing = await resolveOrderPricing(companyId!, {
      lines: parsed.data.lines,
      partnerId: parsed.data.partnerId,
      loyaltyCardId: parsed.data.loyaltyCardId,
      customAdjustmentType: parsed.data.customAdjustmentType,
      customAdjustmentValue: parsed.data.customAdjustmentValue,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erreur" }, { status: 404 })
  }
  const { priceMap, total, discountAmount, partner, loyaltyCard } = pricing

  const maxNumber = await prisma.order.aggregate({ where: { companyId }, _max: { orderNumber: true } })
  const orderNumber = (maxNumber._max.orderNumber ?? 0) + 1

  const now = new Date()
  const ticket = await prisma.order.create({
    data: {
      companyId, employeeId: employee.id,
      partnerId: partner?.id ?? null,
      loyaltyCardId: loyaltyCard?.id ?? null,
      total, discountAmount,
      customAdjustmentType: parsed.data.customAdjustmentType ?? null,
      customAdjustmentValue: parsed.data.customAdjustmentValue ?? null,
      status: "NEW",
      orderNumber,
      customerName: parsed.data.customerName || null,
      note: parsed.data.note,
      weekNumber: getISOWeek(now), year: now.getFullYear(),
      lines: {
        create: parsed.data.lines.map(l => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          unitPrice: priceMap.get(l.menuItemId)!.price,
          costPrice: priceMap.get(l.menuItemId)!.costPrice,
        })),
      },
    },
    include: TICKET_INCLUDE,
  })

  await deductOrderStock(companyId!, parsed.data.lines)

  return NextResponse.json(ticket, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const tickets = await prisma.order.findMany({
    where: { companyId: session.user.companyId, status: { in: ["NEW", "CLAIMED", "IN_PROGRESS"] } },
    include: TICKET_INCLUDE,
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(tickets)
}
