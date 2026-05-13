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
  employees: { name: string; grade: string; orderCount: number; revenue: number; salary: number }[]
  test?: boolean
}

export function isDiscordUrl(url: string) {
  return /discord(?:app)?\.com\/api\/webhooks\//.test(url)
}

export function formatDiscordBody(payload: WebhookPayload): object {
  const empLines = payload.employees.length > 0
    ? payload.employees.map(e => `• **${e.name}** (${e.grade}) — ${e.orderCount} cmd · ${fmt(e.revenue, payload.currency)} · salaire ${fmt(e.salary, payload.currency)}`).join("\n")
    : "_Aucun employé actif cette semaine_"

  return {
    embeds: [{
      title: `📊 Bilan semaine S${String(payload.weekNumber).padStart(2, "0")} ${payload.year}${payload.test ? " — TEST" : ""}`,
      description: `**${payload.restaurant}**\n${payload.weekStart} → ${payload.weekEnd}`,
      color: 0x6366f1,
      fields: [
        { name: "💰 CA semaine", value: fmt(payload.revenue, payload.currency), inline: true },
        { name: "🧾 Commandes", value: String(payload.orderCount), inline: true },
        { name: "👥 Salaires", value: fmt(payload.totalSalaries, payload.currency), inline: true },
        { name: "Détail employés", value: empLines, inline: false },
      ],
      footer: { text: "RestoCompta" },
      timestamp: new Date().toISOString(),
    }],
  }
}

export async function buildWebhookPayload(
  restaurantId: string,
  restaurantName: string,
  currency: string,
  week: number,
  year: number
): Promise<WebhookPayload> {
  const { start, end } = getWeekBounds(week, year)

  const [orders, employees] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId, status: "CONFIRMED", weekNumber: week, year },
      include: { lines: true, employee: { include: { grade: true } } },
    }),
    prisma.employee.findMany({ where: { restaurantId, isActive: true }, include: { grade: true } }),
  ])

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
    employees: employeeStats,
  }
}

export function buildBody(payload: WebhookPayload, url: string): object {
  if (isDiscordUrl(url)) return formatDiscordBody(payload)
  return payload
}
