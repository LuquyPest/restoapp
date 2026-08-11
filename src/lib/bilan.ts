import { calculateTax } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export function computeBilan(
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

// Recalcule et sauvegarde le WeeklyReport d'une semaine (upsert), pour réutilisation
// entre la sauvegarde/téléchargement du Bilan et la déclaration d'impôt.
export async function saveWeeklyReport(companyId: string, week: number, year: number, opts?: { taxDeclared?: boolean }) {
  const [company, orders, allCharges, employees] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.order.findMany({ where: { companyId, status: "CONFIRMED", weekNumber: week, year }, include: { lines: true } }),
    prisma.charge.findMany({ where: { companyId, isActive: true, deletedAt: null } }),
    prisma.employee.findMany({ where: { companyId, isActive: true }, include: { grade: true } }),
  ])
  if (!company) throw new Error("Introuvable")

  const charges = allCharges.filter((c: any) =>
    (!c.weekNumber && !c.year) || (c.weekNumber === week && c.year === year)
  )

  const bonusRate = company.bonusRate ?? 10
  const dividendRate = company.dividendRate ?? 72.26
  const bilan = computeBilan(orders, charges, employees, bonusRate, dividendRate, { taxType: company.taxType, taxBrackets: company.taxBrackets })

  const data = {
    revenue: bilan.revenue, costRevenue: bilan.costRevenue, salaries: bilan.totalSalaries,
    chargesDeductible: bilan.chargesDeductible, chargesNonDeductible: bilan.chargesNonDeductible,
    grossProfit: bilan.grossProfit, taxes: bilan.taxes, netProfit: bilan.netProfit,
    bonusTotal: bilan.bonusTotal, dividendTotal: bilan.dividendTotal, treasury: bilan.treasury,
    partnerRevenue: bilan.partnerRevenue, clientRevenue: bilan.clientRevenue,
    savedDividend: bilan.dividendTotal, savedTreasury: bilan.treasury,
    ...(opts?.taxDeclared !== undefined ? { taxDeclared: opts.taxDeclared } : {}),
  }

  const report = await prisma.weeklyReport.upsert({
    where: { companyId_weekNumber_year: { companyId, weekNumber: week, year } },
    create: { companyId, weekNumber: week, year, ...data },
    update: data,
  })

  return { report, bilan, company }
}
