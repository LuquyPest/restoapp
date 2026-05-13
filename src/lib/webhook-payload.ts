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

export interface WebhookPayload {
  event: string
  restaurant: string
  currency: string
  weekNumber: number
  year: number
  weekStart: string
  weekEnd: string
  revenue: number
  orderCount: number
  totalSalaries: number
  chargesDeductible: number
  chargesNonDeductible: number
  grossProfit: number
  taxes: number
  netProfit: number
  treasury: number
  employees: { name: string; grade: string; orderCount: number; revenue: number; salary: number }[]
  test?: boolean
}

export function isDiscordUrl(url: string) {
  return /discord(?:app)?\.com\/api\/webhooks\//.test(url)
}

export function formatDiscordEmbed(payload: WebhookPayload): object {
  const empLines = payload.employees.length > 0
    ? payload.employees.map(e => `• **${e.name}** (${e.grade}) — ${e.orderCount} cmd · ${fmt(e.revenue, payload.currency)} · salaire ${fmt(e.salary, payload.currency)}`).join("\n")
    : "_Aucun employé actif cette semaine_"

  return {
    embeds: [{
      title: `📊 Bilan S${String(payload.weekNumber).padStart(2, "0")} ${payload.year}${payload.test ? " — TEST" : ""}`,
      description: `**${payload.restaurant}**\n${payload.weekStart} → ${payload.weekEnd}`,
      color: 0x6366f1,
      fields: [
        { name: "💰 CA semaine", value: fmt(payload.revenue, payload.currency), inline: true },
        { name: "🧾 Commandes", value: String(payload.orderCount), inline: true },
        { name: "👥 Salaires", value: fmt(payload.totalSalaries, payload.currency), inline: true },
        { name: "📉 Charges déductibles", value: fmt(payload.chargesDeductible, payload.currency), inline: true },
        { name: "📈 Bénéfice net", value: fmt(payload.netProfit, payload.currency), inline: true },
        { name: "🏦 Trésorerie", value: fmt(payload.treasury, payload.currency), inline: true },
        { name: "Détail employés", value: empLines, inline: false },
      ],
      footer: { text: "RestoCompta · Rapport joint en PDF" },
      timestamp: new Date().toISOString(),
    }],
    attachments: [{ id: 0, filename: `bilan-S${String(payload.weekNumber).padStart(2,"0")}-${payload.year}.pdf` }],
  }
}

export function buildBody(payload: WebhookPayload, url: string): object {
  if (isDiscordUrl(url)) return formatDiscordEmbed(payload)
  return payload
}

export async function sendWebhook(url: string, payload: WebhookPayload, pdfBuffer: Buffer): Promise<string> {
  const filename = `bilan-S${String(payload.weekNumber).padStart(2, "0")}-${payload.year}.pdf`

  if (isDiscordUrl(url)) {
    const form = new FormData()
    form.append("payload_json", JSON.stringify(formatDiscordEmbed(payload)))
    form.append("files[0]", new Blob([pdfBuffer.buffer as ArrayBuffer], { type: "application/pdf" }), filename)
    const res = await fetch(url, { method: "POST", body: form, signal: AbortSignal.timeout(30_000) })
    return res.ok ? `ok (${res.status})` : `error (${res.status})`
  }

  const body = { ...payload, pdf: { filename, data: pdfBuffer.toString("base64") } }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  })
  return res.ok ? `ok (${res.status})` : `error (${res.status})`
}

export async function buildWebhookPayload(
  restaurantId: string,
  restaurantName: string,
  currency: string,
  week: number,
  year: number
): Promise<WebhookPayload> {
  const { start, end } = getWeekBounds(week, year)

  const [orders, employees, allCharges] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId, status: "CONFIRMED", weekNumber: week, year },
      include: { lines: true, employee: { include: { grade: true } } },
    }),
    prisma.employee.findMany({ where: { restaurantId, isActive: true }, include: { grade: true } }),
    prisma.charge.findMany({ where: { restaurantId, isActive: true, deletedAt: null } }),
  ])

  const charges = allCharges.filter(c =>
    (!c.weekNumber && !c.year) || (c.weekNumber === week && c.year === year)
  )

  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const orderCount = orders.length

  const employeeStats = employees.map(emp => {
    const empOrders = orders.filter(o => o.employeeId === emp.id)
    const empRevenue = empOrders.reduce((s, o) => s + o.total, 0)
    const salary = empRevenue * (emp.grade.salaryPercent / 100)
    return {
      name: `${emp.firstName} ${emp.lastName}`,
      grade: emp.grade.name,
      orderCount: empOrders.length,
      revenue: empRevenue,
      salary,
    }
  }).filter(e => e.orderCount > 0)

  const totalSalaries = employeeStats.reduce((s, e) => s + e.salary, 0)
  const chargesDeductible = charges.filter(c => c.type === "DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)
  const chargesNonDeductible = charges.filter(c => c.type === "NON_DEDUCTIBLE").reduce((s, c) => s + c.amount, 0)
  const grossProfit = revenue - totalSalaries - chargesDeductible
  const taxes = grossProfit > 0 ? calculateTax(grossProfit) : 0
  const netProfit = grossProfit - taxes
  const treasury = netProfit - chargesNonDeductible

  return {
    event: "weekly_report",
    restaurant: restaurantName,
    currency,
    weekNumber: week,
    year,
    weekStart: formatDate(start),
    weekEnd: formatDate(end),
    revenue,
    orderCount,
    totalSalaries,
    chargesDeductible,
    chargesNonDeductible,
    grossProfit,
    taxes,
    netProfit,
    treasury,
    employees: employeeStats,
  }
}
