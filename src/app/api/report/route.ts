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

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
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

  const [restaurant, orders, charges, employees, suppliers, invoices, loyaltyCards, partners] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    prisma.order.findMany({
      where: { restaurantId, status: "CONFIRMED", weekNumber: week, year },
      include: { lines: { include: { menuItem: true } }, partner: true, loyaltyCard: true, employee: { include: { grade: true } } },
    }),
    prisma.charge.findMany({ where: { restaurantId, isActive: true } }),
    prisma.employee.findMany({ where: { restaurantId, isActive: true }, include: { grade: true } }),
    prisma.supplier.findMany({ where: { restaurantId } }),
    prisma.invoice.findMany({ where: { restaurantId }, include: { supplier: true } }),
    prisma.loyaltyCard.findMany({ where: { restaurantId } }),
    prisma.partner.findMany({ where: { restaurantId } }),
  ])

  if (!restaurant) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const taxRate = restaurant.taxRate ?? 11.9
  const bonusRate = restaurant.bonusRate ?? 10
  const dividendRate = restaurant.dividendRate ?? 72.26

  // Revenue
  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const costRevenue = orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
  const partnerRevenue = orders.filter(o => o.partnerId).reduce((s, o) => s + o.total, 0)
  const clientRevenue = revenue - partnerRevenue

  // Per-employee stats
  const employeeStats = employees.map(emp => {
    const empOrders = orders.filter(o => o.employeeId === emp.id)
    const empRevenue = empOrders.reduce((s, o) => s + o.total, 0)
    const empCost = empOrders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
    const empNetRevenue = empRevenue - empCost
    const salary = empNetRevenue * (emp.grade.salaryPercent / 100)
    return {
      employeeId: emp.id, firstName: emp.firstName, lastName: emp.lastName,
      grade: emp.grade.name, salaryPercent: emp.grade.salaryPercent,
      dividendPercent: emp.grade.dividendPercent ?? 0,
      accountNumber: emp.accountNumber,
      revenue: empRevenue, costRevenue: empCost, netRevenue: empNetRevenue, salary,
    }
  })

  const totalSalaries = employeeStats.reduce((s, e) => s + e.salary, 0)
  const chargesDeductible = charges.filter(c => c.type === "DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)
  const chargesNonDeductible = charges.filter(c => c.type === "NON_DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)

  // Bilan calculations (Excel formulas)
  const afterSalaries = revenue - totalSalaries
  const grossProfit = afterSalaries - chargesDeductible
  const taxes = grossProfit > 0 ? grossProfit * (taxRate / 100) : 0
  const netProfit = grossProfit - taxes
  const bonusTotal = netProfit > 0 ? netProfit * (bonusRate / 100) : 0
  const afterBonus = netProfit - bonusTotal
  const dividendTotal = afterBonus > 0 ? afterBonus * (dividendRate / 100) : 0
  const treasury = afterBonus - dividendTotal
  const finalProfit = treasury - chargesNonDeductible

  // Per-employee dividend (% of total dividends)
  const employeeStatsWithDividend = employeeStats.map(emp => ({
    ...emp,
    dividend: dividendTotal * ((emp.dividendPercent ?? 0) / 100),
  }))

  // Partner summary
  const partnerMap = new Map<string, { name: string; revenue: number; discount: number }>()
  for (const order of orders.filter(o => o.partner)) {
    const ex = partnerMap.get(order.partnerId!) ?? { name: order.partner!.name, revenue: 0, discount: 0 }
    ex.revenue += order.total; ex.discount += order.discountAmount
    partnerMap.set(order.partnerId!, ex)
  }

  // Product sales
  const productMap = new Map<string, { name: string; category: string; qty: number; revenue: number; cost: number }>()
  for (const order of orders) {
    for (const line of order.lines) {
      const ex = productMap.get(line.menuItemId) ?? { name: line.menuItem.name, category: line.menuItem.category, qty: 0, revenue: 0, cost: 0 }
      ex.qty += line.quantity; ex.revenue += line.unitPrice * line.quantity; ex.cost += line.costPrice * line.quantity
      productMap.set(line.menuItemId, ex)
    }
  }
  const productStats = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue)

  // Daily data
  const days = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
  const dailyData = days.map((label, i) => {
    const dayStart = new Date(start); dayStart.setDate(start.getDate() + i); dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(dayStart); dayEnd.setHours(23,59,59,999)
    const value = orders.filter(o => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd).reduce((s, o) => s + o.total, 0)
    return { label, value, date: formatDate(dayStart) }
  })

  return NextResponse.json({
    weekNumber: week, year,
    weekStart: formatDate(start), weekEnd: formatDate(end),
    revenue, costRevenue, totalSalaries,
    chargesDeductible, chargesNonDeductible,
    afterSalaries, grossProfit, taxes, netProfit,
    bonusTotal, afterBonus, dividendTotal, treasury, finalProfit,
    clientRevenue, partnerRevenue,
    taxRate, bonusRate, dividendRate,
    employeeStats: employeeStatsWithDividend,
    partnerSummary: Array.from(partnerMap.values()),
    productStats,
    dailyData,
    // Full data for HTML export
    allOrders: orders.map(o => ({
      id: o.id, total: o.total, discountAmount: o.discountAmount,
      createdAt: o.createdAt,
      employeeName: o.employee ? `${o.employee.firstName} ${o.employee.lastName}` : "—",
      partnerName: o.partner?.name ?? null,
      loyaltyName: o.loyaltyCard ? `${o.loyaltyCard.firstName} ${o.loyaltyCard.lastName}` : null,
      lines: o.lines.map(l => ({ name: l.menuItem.name, qty: l.quantity, price: l.unitPrice, cost: l.costPrice })),
    })),
    suppliers: suppliers.map(s => ({ name: s.name, contact: s.contact, email: s.email, phone: s.phone })),
    invoices: invoices.map(i => ({ ref: i.reference, supplier: i.supplier.name, amount: i.amount, dueDate: i.dueDate, status: i.status })),
    loyaltyCards: loyaltyCards.map(c => ({ name: `${c.firstName} ${c.lastName}`, discount: c.discountPercent, expiresAt: c.expiresAt, isActive: c.isActive })),
    partners: partners.map(p => ({ name: p.name, discount: p.discountPercent, isActive: p.isActive })),
    charges: charges.map(c => ({ name: c.name, amount: c.amount, type: c.type, isActive: c.isActive })),
    restaurantName: restaurant.name,
    currency: restaurant.currency,
  })
}

const saveSchema = z.object({
  week: z.number(), year: z.number(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { restaurantId, role } = session.user
  if (role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const body = await req.json()
  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  const { week, year } = parsed.data
  const { start, end } = getWeekBounds(week, year)

  const [restaurant, orders, charges, payrolls] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    prisma.order.findMany({ where: { restaurantId, status: "CONFIRMED", weekNumber: week, year }, include: { lines: true } }),
    prisma.charge.findMany({ where: { restaurantId, isActive: true } }),
    prisma.payroll.findMany({ where: { restaurantId, weekNumber: week, year } }),
  ])
  if (!restaurant) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const taxRate = restaurant.taxRate ?? 11.9
  const bonusRate = restaurant.bonusRate ?? 10
  const dividendRate = restaurant.dividendRate ?? 72.26
  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const costRevenue = orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
  const partnerRevenue = orders.filter(o => o.partnerId).reduce((s, o) => s + o.total, 0)
  const clientRevenue = revenue - partnerRevenue
  const chargesDeductible = charges.filter(c => c.type === "DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)
  const chargesNonDeductible = charges.filter(c => c.type === "NON_DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)
  const salaries = payrolls.reduce((s, p) => s + p.netSalary, 0)
  const afterSalaries = revenue - salaries
  const grossProfit = afterSalaries - chargesDeductible
  const taxes = grossProfit > 0 ? grossProfit * (taxRate / 100) : 0
  const netProfit = grossProfit - taxes
  const bonusTotal = netProfit > 0 ? netProfit * (bonusRate / 100) : 0
  const afterBonus = netProfit - bonusTotal
  const dividendTotal = afterBonus > 0 ? afterBonus * (dividendRate / 100) : 0
  const treasury = afterBonus - dividendTotal

  const report = await prisma.weeklyReport.upsert({
    where: { restaurantId_weekNumber_year: { restaurantId, weekNumber: week, year } },
    create: { restaurantId, weekNumber: week, year, revenue, costRevenue, salaries, chargesDeductible, chargesNonDeductible, grossProfit, taxes, netProfit, bonusTotal, dividendTotal, treasury, partnerRevenue, clientRevenue, savedDividend: dividendTotal, savedTreasury: treasury, taxDeclared: true },
    update: { revenue, costRevenue, salaries, chargesDeductible, chargesNonDeductible, grossProfit, taxes, netProfit, bonusTotal, dividendTotal, treasury, partnerRevenue, clientRevenue, savedDividend: dividendTotal, savedTreasury: treasury, taxDeclared: true },
  })
  return NextResponse.json(report)
}
