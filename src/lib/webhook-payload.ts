import { prisma } from "@/lib/prisma"

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

function fmt(n: number, currency: string) {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

function calculateTax(profit: number): number {
  if (profit <= 50000) return 0
  if (profit <= 100000) return (profit - 50000) * 0.20
  if (profit <= 500000) return (50000 * 0.20) + (profit - 100000) * 0.30
  return (50000 * 0.20) + (400000 * 0.30) + (profit - 500000) * 0.40
}

export function isDiscordUrl(url: string) {
  return /discord(?:app)?\.com\/api\/webhooks\//.test(url)
}

export function formatDiscordEmbed(data: any, week: number, year: number): object {
  const currency = data.currency ?? ""
  const empLines = (data.employeeStats ?? []).length > 0
    ? (data.employeeStats ?? []).map((e: any) => `• **${e.firstName} ${e.lastName}** (${e.grade}) — ${fmt(e.revenue, currency)} · salaire ${fmt(e.salary, currency)}`).join("\n")
    : "_Aucun employé actif cette semaine_"

  return {
    embeds: [{
      title: `📊 Bilan S${String(week).padStart(2, "0")} ${year}${data.test ? " — TEST" : ""}`,
      description: `**${data.restaurantName}**\n${data.weekStart} → ${data.weekEnd}`,
      color: 0x6366f1,
      fields: [
        { name: "💰 CA semaine", value: fmt(data.revenue, currency), inline: true },
        { name: "🧾 Commandes", value: String(data.allOrders?.length ?? 0), inline: true },
        { name: "👥 Salaires", value: fmt(data.totalSalaries, currency), inline: true },
        { name: "📉 Charges déductibles", value: fmt(data.chargesDeductible, currency), inline: true },
        { name: "📈 Bénéfice net", value: fmt(data.netProfit, currency), inline: true },
        { name: "🏦 Trésorerie", value: fmt(data.treasury, currency), inline: true },
        { name: "Détail employés", value: empLines, inline: false },
      ],
      footer: { text: "RestoCompta · Bilan joint en HTML" },
      timestamp: new Date().toISOString(),
    }],
    attachments: [{ id: 0, filename: `bilan-S${String(week).padStart(2,"0")}-${year}.html` }],
  }
}

export async function sendWebhook(url: string, data: any, htmlBuffer: Buffer, week: number, year: number): Promise<string> {
  const filename = `bilan-S${String(week).padStart(2, "0")}-${year}.html`

  if (isDiscordUrl(url)) {
    const form = new FormData()
    form.append("payload_json", JSON.stringify(formatDiscordEmbed(data, week, year)))
    form.append("files[0]", new Blob([htmlBuffer.buffer as ArrayBuffer], { type: "text/html;charset=utf-8" }), filename)
    const res = await fetch(url, { method: "POST", body: form, signal: AbortSignal.timeout(30_000) })
    return res.ok ? `ok (${res.status})` : `error (${res.status})`
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, html: { filename, data: htmlBuffer.toString("base64") } }),
    signal: AbortSignal.timeout(30_000),
  })
  return res.ok ? `ok (${res.status})` : `error (${res.status})`
}

export async function buildReportData(
  restaurantId: string,
  restaurantName: string,
  currency: string,
  week: number,
  year: number
): Promise<any> {
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

  const charges = allCharges.filter((c: any) =>
    (!c.weekNumber && !c.year) || (c.weekNumber === week && c.year === year)
  )

  const bonusRate = restaurant?.bonusRate ?? 10
  const dividendRate = restaurant?.dividendRate ?? 72.26

  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const employeeStats = employees.map(emp => {
    const empOrders = orders.filter(o => o.employeeId === emp.id)
    const empRevenue = empOrders.reduce((s, o) => s + o.total, 0)
    const empCost = empOrders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
    const salary = empRevenue * (emp.grade.salaryPercent / 100)
    const dividendPercent = (emp.grade as any).dividendPercent ?? 0
    return {
      employeeId: emp.id, firstName: emp.firstName, lastName: emp.lastName,
      grade: emp.grade.name, salaryPercent: emp.grade.salaryPercent, dividendPercent,
      accountNumber: (emp as any).accountNumber,
      revenue: empRevenue, costRevenue: empCost, netRevenue: empRevenue - empCost, salary,
    }
  })

  const totalSalaries = employeeStats.reduce((s, e) => s + e.salary, 0)
  const chargesDeductible = charges.filter(c => c.type === "DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)
  const chargesNonDeductible = charges.filter(c => c.type === "NON_DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)
  const afterSalaries = revenue - totalSalaries
  const grossProfit = afterSalaries - chargesDeductible
  const taxes = grossProfit > 0 ? calculateTax(grossProfit) : 0
  const netProfit = grossProfit - taxes
  const bonusTotal = netProfit > 0 ? netProfit * (bonusRate / 100) : 0
  const dividendTotal = netProfit > 0 ? netProfit * (dividendRate / 100) : 0
  const treasury = netProfit - bonusTotal - dividendTotal - chargesNonDeductible

  const employeeStatsWithDividend = employeeStats.map(e => ({
    ...e,
    dividend: dividendTotal * ((e.dividendPercent ?? 0) / 100),
  }))

  const partnerMap = new Map<string, { name: string; revenue: number; discount: number }>()
  for (const order of orders.filter(o => o.partner)) {
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

  const days = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
  const dailyData = days.map((label, i) => {
    const dayStart = new Date(start); dayStart.setDate(start.getDate() + i); dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(dayStart); dayEnd.setHours(23,59,59,999)
    const value = orders.filter(o => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd).reduce((s, o) => s + o.total, 0)
    return { label, value, date: formatDate(dayStart) }
  })

  return {
    restaurantName, currency, weekNumber: week, year,
    weekStart: formatDate(start), weekEnd: formatDate(end),
    revenue, totalSalaries, chargesDeductible, chargesNonDeductible,
    afterSalaries, grossProfit, taxes, netProfit, bonusTotal,
    afterBonus: netProfit, dividendTotal, treasury, finalProfit: treasury,
    clientRevenue: revenue - orders.filter(o => o.partnerId).reduce((s, o) => s + o.total, 0),
    partnerRevenue: orders.filter(o => o.partnerId).reduce((s, o) => s + o.total, 0),
    costRevenue: orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0),
    bonusRate, dividendRate,
    taxRate: 0,
    employeeStats: employeeStatsWithDividend,
    partnerSummary: Array.from(partnerMap.values()),
    productStats: Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue),
    dailyData,
    allOrders: orders.map(o => ({
      id: o.id, total: o.total, discountAmount: o.discountAmount, createdAt: o.createdAt,
      employeeName: o.employee ? `${o.employee.firstName} ${o.employee.lastName}` : "—",
      partnerName: (o.partner as any)?.name ?? null,
      loyaltyName: o.loyaltyCard ? `${o.loyaltyCard.firstName} ${o.loyaltyCard.lastName}` : null,
      lines: o.lines.map(l => ({ name: l.menuItem.name, qty: l.quantity, price: l.unitPrice, cost: l.costPrice })),
    })),
    suppliers: suppliers.map(s => ({ name: s.name, contact: (s as any).contact, email: (s as any).email, phone: (s as any).phone })),
    invoices: invoices.map(i => ({ ref: (i as any).reference, supplier: (i as any).supplier.name, amount: i.amount, dueDate: i.dueDate, status: i.status })),
    loyaltyCards: loyaltyCards.map(c => ({ name: `${c.firstName} ${c.lastName}`, discount: c.discountPercent, expiresAt: c.expiresAt, isActive: c.isActive })),
    partners: partners.map(p => ({ name: p.name, discount: p.discountPercent, isActive: p.isActive })),
    charges: charges.map(c => ({ name: c.name, amount: c.amount, type: c.type })),
  }
}
