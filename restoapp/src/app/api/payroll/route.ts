import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const generateSchema = z.object({
  periodStart: z.string(),
  periodEnd: z.string(),
  taxRate: z.number().min(0).max(100).optional(),
  bonuses: z.record(z.number()).optional(),
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
    orderBy: { periodStart: "desc" },
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

  const { periodStart, periodEnd, taxRate = 0, bonuses = {} } = parsed.data
  const start = new Date(periodStart)
  const end = new Date(periodEnd)

  const employees = await prisma.employee.findMany({
    where: { restaurantId, isActive: true },
    include: { grade: true },
  })

  const created = []

  for (const emp of employees) {
    const orders = await prisma.order.findMany({
      where: {
        employeeId: emp.id,
        status: "CONFIRMED",
        createdAt: { gte: start, lte: end },
      },
    })

    const revenue = orders.reduce((s, o) => s + o.total, 0)
    const grossSalary = revenue * (emp.grade.salaryPercent / 100)
    const bonus = bonuses[emp.id] ?? 0
    const taxes = grossSalary * (taxRate / 100)
    const netSalary = grossSalary + bonus - taxes

    const existing = await prisma.payroll.findFirst({
      where: { employeeId: emp.id, periodStart: start, periodEnd: end },
    })

    if (!existing) {
      const payroll = await prisma.payroll.create({
        data: {
          restaurantId,
          employeeId: emp.id,
          periodStart: start,
          periodEnd: end,
          revenue,
          grossSalary,
          taxes,
          bonus,
          netSalary,
        },
      })
      created.push(payroll)
    }
  }

  return NextResponse.json(created, { status: 201 })
}
