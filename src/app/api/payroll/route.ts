import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"

const generateSchema = z.object({
  weekNumber: z.number().int().min(1).max(53),
  year: z.number().int().min(2020).max(2099),
  taxRate: z.number().min(0).max(100).optional(),
  bonuses: z.record(z.string(), z.number()).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { restaurantId, role } = session.user

  const where = role === "EMPLOYEE"
    ? { restaurantId, employee: { userId: session.user.id } }
    : { restaurantId }

  const payrolls = await prisma.payroll.findMany({
    where,
    include: { employee: { include: { grade: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(payrolls)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role !== "OWNER" && role !== "MANAGER") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = generateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { weekNumber, year, taxRate = 0, bonuses = {} } = parsed.data

  const employees = await prisma.employee.findMany({
    where: { restaurantId, isActive: true },
    include: { grade: true },
  })

  const created = []

  for (const emp of employees) {
    const orders = await prisma.order.findMany({
      where: { employeeId: emp.id, status: "CONFIRMED", weekNumber, year },
      include: { lines: true },
    })

    const revenue = orders.reduce((s, o) => s + o.total, 0)
    const costRevenue = orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
    const netRevenue = revenue - costRevenue
    const grossSalary = netRevenue * (emp.grade.salaryPercent / 100)
    const bonus = bonuses[emp.id] ?? 0
    const taxes = grossSalary * (taxRate / 100)
    const netSalary = grossSalary + bonus - taxes

    const existing = await prisma.payroll.findFirst({
      where: { employeeId: emp.id, weekNumber, year },
    })

    if (!existing) {
      const payroll = await prisma.payroll.create({
        data: {
          restaurantId,
          employeeId: emp.id,
          weekNumber,
          year,
          revenue,
          costRevenue,
          grossSalary,
          taxes,
          bonus,
          netSalary,
          totalToPay: netSalary,
        },
      })
      created.push(payroll)
    }
  }

  log({
    action: "PAYROLL_GENERATED",
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    restaurantId,
    ip: getIp(req.headers),
    metadata: { weekNumber, year, count: created.length },
  })
  return NextResponse.json(created, { status: 201 })
}
