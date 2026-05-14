import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { getIp } from "@/lib/logger"
import { z } from "zod"
import { checkApiPageAccess } from "@/lib/page-access"
import { getWeekBounds, calculateTax, formatDate } from "@/lib/utils"

function computeBilan(
  orders: any[], charges: any[], employees: any[],
  bonusRate: number, dividendRate: number,
  taxConfig?: { taxType?: string | null; taxBrackets?: string | null } | null
) {
  const revenue = orders.reduce((s: number, o: any) => s + o.total, 0)
  const costRevenue = orders.reduce((s: number, o: any) => s + (o.lines ?? []).reduce((ls: number, l: any) => ls + l.costPrice * l.quantity, 0), 0)
  const partnerRevenue = orders.filter((o: any) => o.partnerId).reduce((s: number, o: any) => s + o.total, 0)
  const clientRevenue = revenue - partnerRevenue

  const employeeStats = employees.map((emp: any) => {
    const empOrders = orders.filter((o: any) => o.employeeId === emp.id)
    const empRevenue = empOrders.reduce((s: number, o: any) => s + o.total, 0)
    const empCost = empOrders.reduce((s: number, o: any) => s + (o.lines ?? []).reduce((ls: number, l: any) => ls + l.costPrice * l.quantity, 0), 0)
    const empNetRevenue = empRevenue - empCost
    const salary = empRevenue * (emp.grade.salaryPercent / 100)
    return {
      employeeId: emp.id, firstName: emp.firstName, lastName: emp.lastName,
      grade: emp.grade.name, salaryPercent: emp.grade.salaryPercent,
      dividendPercent: emp.grade.dividendPercent ?? 0,
      accountNumber: emp.accountNumber,
      revenue: empRevenue, costRevenue: empCost, netRevenue: empNetRevenue, salary,
    }
  })

  const totalSalaries = employeeStats.reduce((s: number, e: any) => s + e.salary, 0)
  // Only include charges for this week (non-global filtered by caller, global always included)
  const chargesDeductible = charges.filter((c: any) => c.type === "DEDUCTIBLE").reduce((s: number, c: any) => s + c.amount, 0)
  const chargesNonDeductible = charges.filter((c: any) => c.type === "NON_DEDUCTIBLE").reduce((s: number, c: any) => s + c.amount, 0)

  const afterSalaries = revenue - totalSalaries
  const grossProfit = afterSalaries - chargesDeductible
  const taxes = grossProfit > 0 ? calculateTax(grossProfit, taxConfig) : 0
  const netProfit = grossProfit - taxes
  const bonusTotal = netProfit > 0 ? netProfit * (bonusRate / 100) : 0
  const dividendTotal = netProfit > 0 ? netProfit * (dividendRate / 100) : 0
  const treasury = netProfit - bonusTotal - dividendTotal - chargesNonDeductible
  const finalProfit = treasury

  const employeeStatsWithDividend = employeeStats.map((emp: any) => ({
    ...emp,
    dividend: dividendTotal * ((emp.dividendPercent ?? 0) / 100),
  }))

  return {
    revenue, costRevenue, totalSalaries, chargesDeductible, chargesNonDeductible,
    afterSalaries, grossProfit, taxes, netProfit, bonusTotal,
    afterBonus: netProfit, dividendTotal, treasury, finalProfit,
    clientRevenue, partnerRevenue, employeeStats: employeeStatsWithDividend,
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { restaurantId, role } = session.user
  if (!await checkApiPageAccess(session, "report", ["OWNER"])) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  if (!await checkRateLimit(`report:${session.user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })
  }

  const url = new URL(req.url)
  const weekRaw = parseInt(url.searchParams.get("week") ?? "1")
  const yearRaw = parseInt(url.searchParams.get("year") ?? String(new Date().getFullYear()))
  if (!Number.isInteger(weekRaw) || weekRaw < 1 || weekRaw > 53 ||
      !Number.isInteger(yearRaw) || yearRaw < 2020 || yearRaw > 2099) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
  }
  const week = weekRaw
  const year = yearRaw
  const { start, end } = getWeekBounds(week, year)

  const [restaurant, orders, allCharges, employees, suppliers, invoices, loyaltyCards, partners] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    prisma.order.findMany({
      where: { restaurantId, status: "CONFIRMED", weekNumber: week, year },
      include: { lines: { include: { menuItem: true } }, partner: true, loyaltyCard: true, employee: { include: { grade: true } } },
    }),
    prisma.charge.findMany({ where: { restaurantId, isActive: true, deletedAt: null } }),
    prisma.employee.findMany({ where: { restaurantId, isActive: true }, include: { grade: true } }),
    prisma.supplier.findMany({ where: { restaurantId } }),
    prisma.invoice.findMany({ where: { restaurantId, deletedAt: null }, include: { supplier: true } }),
    prisma.loyaltyCard.findMany({ where: { restaurantId } }),
    prisma.partner.findMany({ where: { restaurantId } }),
  ])

  if (!restaurant) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  // Filter charges: global (no week) OR matching this week
  const charges = allCharges.filter((c: any) =>
    (!c.weekNumber && !c.year) || (c.weekNumber === week && c.year === year)
  )

  const bonusRate = restaurant.bonusRate ?? 10
  const dividendRate = restaurant.dividendRate ?? 72.26
  const bilan = computeBilan(orders, charges, employees, bonusRate, dividendRate, { taxType: (restaurant as any).taxType, taxBrackets: (restaurant as any).taxBrackets })

  const partnerMap = new Map<string, { name: string; revenue: number; discount: number }>()
  for (const order of orders.filter((o: any) => o.partner)) {
    const ex = partnerMap.get(order.partnerId!) ?? { name: order.partner!.name, revenue: 0, discount: 0 }
    ex.revenue += order.total; ex.discount += order.discountAmount
    partnerMap.set(order.partnerId!, ex)
  }

  const productMap = new Map<string, { name: string; category: string; qty: number; revenue: number; cost: number }>()
  for (const order of orders) {
    for (const line of order.lines) {
      const ex = productMap.get(line.menuItemId) ?? { name: line.menuItem.name, category: line.menuItem.category, qty: 0, revenue: 0, cost: 0 }
      ex.qty += line.quantity; ex.revenue += line.unitPrice * line.quantity; ex.cost += line.costPrice * line.quantity
      productMap.set(line.menuItemId, ex)
    }
  }
  const productStats = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue)

  const days = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
  const dailyData = days.map((label, i) => {
    const dayStart = new Date(start); dayStart.setDate(start.getDate() + i); dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(dayStart); dayEnd.setHours(23,59,59,999)
    const value = orders.filter((o: any) => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd).reduce((s: number, o: any) => s + o.total, 0)
    return { label, value, date: formatDate(dayStart) }
  })

  return NextResponse.json({
    weekNumber: week, year,
    weekStart: formatDate(start), weekEnd: formatDate(end),
    ...bilan,
    bonusRate, dividendRate,
    partnerSummary: Array.from(partnerMap.values()),
    productStats, dailyData,
    allOrders: orders.map((o: any) => ({
      id: o.id, total: o.total, discountAmount: o.discountAmount, createdAt: o.createdAt,
      employeeName: o.employee ? `${o.employee.firstName} ${o.employee.lastName}` : "—",
      partnerName: o.partner?.name ?? null,
      loyaltyName: o.loyaltyCard ? `${o.loyaltyCard.firstName} ${o.loyaltyCard.lastName}` : null,
      lines: o.lines.map((l: any) => ({ name: l.menuItem.name, qty: l.quantity, price: l.unitPrice, cost: l.costPrice })),
    })),
    suppliers: suppliers.map((s: any) => ({ name: s.name, contact: s.contact, email: s.email, phone: s.phone })),
    invoices: invoices.map((i: any) => ({ ref: i.reference, supplier: i.supplier.name, amount: i.amount, dueDate: i.dueDate, status: i.status })),
    loyaltyCards: loyaltyCards.map((c: any) => ({ name: `${c.firstName} ${c.lastName}`, discount: c.discountPercent, expiresAt: c.expiresAt, isActive: c.isActive })),
    partners: partners.map((p: any) => ({ name: p.name, discount: p.discountPercent, isActive: p.isActive })),
    charges: charges.map((c: any) => ({ name: c.name, amount: c.amount, type: c.type, isActive: c.isActive })),
    restaurantName: restaurant.name,
    currency: restaurant.currency,
  })
}

const saveSchema = z.object({
  week: z.number().int().min(1).max(53),
  year: z.number().int().min(2020).max(2099),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { restaurantId, role } = session.user
  if (!await checkApiPageAccess(session, "report", ["OWNER"])) return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const body = await req.json()
  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  const { week, year } = parsed.data

  const [restaurant, orders, allCharges, employees] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    prisma.order.findMany({ where: { restaurantId, status: "CONFIRMED", weekNumber: week, year }, include: { lines: true } }),
    prisma.charge.findMany({ where: { restaurantId, isActive: true, deletedAt: null } }),
    prisma.employee.findMany({ where: { restaurantId, isActive: true }, include: { grade: true } }),
  ])
  if (!restaurant) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const charges = allCharges.filter((c: any) =>
    (!c.weekNumber && !c.year) || (c.weekNumber === week && c.year === year)
  )

  const bonusRate = restaurant.bonusRate ?? 10
  const dividendRate = restaurant.dividendRate ?? 72.26
  const b = computeBilan(orders, charges, employees, bonusRate, dividendRate)

  const report = await prisma.weeklyReport.upsert({
    where: { restaurantId_weekNumber_year: { restaurantId, weekNumber: week, year } },
    create: { restaurantId, weekNumber: week, year, revenue: b.revenue, costRevenue: b.costRevenue, salaries: b.totalSalaries, chargesDeductible: b.chargesDeductible, chargesNonDeductible: b.chargesNonDeductible, grossProfit: b.grossProfit, taxes: b.taxes, netProfit: b.netProfit, bonusTotal: b.bonusTotal, dividendTotal: b.dividendTotal, treasury: b.treasury, partnerRevenue: b.partnerRevenue, clientRevenue: b.clientRevenue, savedDividend: b.dividendTotal, savedTreasury: b.treasury, taxDeclared: true },
    update: { revenue: b.revenue, costRevenue: b.costRevenue, salaries: b.totalSalaries, chargesDeductible: b.chargesDeductible, chargesNonDeductible: b.chargesNonDeductible, grossProfit: b.grossProfit, taxes: b.taxes, netProfit: b.netProfit, bonusTotal: b.bonusTotal, dividendTotal: b.dividendTotal, treasury: b.treasury, partnerRevenue: b.partnerRevenue, clientRevenue: b.clientRevenue, savedDividend: b.dividendTotal, savedTreasury: b.treasury, taxDeclared: true },
  })
  return NextResponse.json(report)
}
