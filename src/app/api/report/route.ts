import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

function getWeekBounds(week: number, year: number) {
  const jan4 = new Date(year, 0, 4)
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const start = new Date(startOfWeek1)
  start.setDate(startOfWeek1.getDate() + (week - 1) * 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { restaurantId, role } = session.user
  if (role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const url = new URL(req.url)
  const week = parseInt(url.searchParams.get("week") ?? "1")
  const year = parseInt(url.searchParams.get("year") ?? String(new Date().getFullYear()))
  const { start, end } = getWeekBounds(week, year)

  const [orders, charges, payrolls, restaurant] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId, status: "CONFIRMED", createdAt: { gte: start, lte: end } },
      include: { lines: true, partner: true },
    }),
    prisma.charge.findMany({ where: { restaurantId, isActive: true } }),
    prisma.payroll.findMany({
      where: { restaurantId, periodStart: { gte: start }, periodEnd: { lte: end } },
    }),
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
  ])

  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const costRevenue = orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
  const salaries = payrolls.reduce((s, p) => s + p.netSalary, 0)
  const totalCharges = charges.reduce((s, c) => s + c.amount, 0)
  const taxRate = restaurant?.taxRate ?? 0
  const grossProfit = revenue - costRevenue - salaries - totalCharges
  const taxes = grossProfit > 0 ? grossProfit * (taxRate / 100) : 0
  const netProfit = grossProfit - taxes
  const partnerRevenue = orders.filter(o => o.partnerId).reduce((s, o) => s + o.total, 0)
  const clientRevenue = revenue - partnerRevenue

  const existing = await prisma.weeklyReport.findFirst({
    where: { restaurantId, weekNumber: week, year },
  })

  const reportData = {
    revenue, costRevenue, salaries,
    charges: totalCharges,
    taxes,
    partnerRevenue, clientRevenue,
    grossProfit,
    netProfit,
    dividend: existing?.dividend ?? 0,
    treasury: existing?.treasury ?? 0,
    taxDeclared: existing?.taxDeclared ?? false,
    weekNumber: week, year,
    chargesList: charges,
    payrollsList: payrolls,
  }

  return NextResponse.json(reportData)
}

const saveSchema = z.object({
  week: z.number(),
  year: z.number(),
  dividend: z.number(),
  treasury: z.number(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { restaurantId, role } = session.user
  if (role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { week, year, dividend, treasury } = parsed.data
  const { start, end } = getWeekBounds(week, year)
  const [orders, charges, payrolls, restaurant] = await Promise.all([
    prisma.order.findMany({ where: { restaurantId, status: "CONFIRMED", createdAt: { gte: start, lte: end } }, include: { lines: true } }),
    prisma.charge.findMany({ where: { restaurantId, isActive: true } }),
    prisma.payroll.findMany({ where: { restaurantId, periodStart: { gte: start }, periodEnd: { lte: end } } }),
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
  ])

  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const costRevenue = orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
  const salaries = payrolls.reduce((s, p) => s + p.netSalary, 0)
  const totalCharges = charges.reduce((s, c) => s + c.amount, 0)
  const taxRate = restaurant?.taxRate ?? 0
  const grossProfit = revenue - costRevenue - salaries - totalCharges
  const taxes = grossProfit > 0 ? grossProfit * (taxRate / 100) : 0

  const report = await prisma.weeklyReport.upsert({
    where: { restaurantId_weekNumber_year: { restaurantId, weekNumber: week, year } },
    create: { restaurantId, weekNumber: week, year, revenue, costRevenue, salaries, charges: totalCharges, taxes, dividend, treasury, taxDeclared: true },
    update: { revenue, costRevenue, salaries, charges: totalCharges, taxes, dividend, treasury, taxDeclared: true },
  })

  return NextResponse.json(report)
}
