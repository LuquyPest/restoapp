import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getWeekRange, getMonthRange, getISOWeek, getISOWeeksInYear, getPrevWeeks } from "@/lib/utils"
import OwnerDashboard from "@/components/dashboard/OwnerDashboard"
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard"

function getWeekRangeByWeek(week: number, year: number) {
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

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ week?: string; year?: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")

  const { companyId, role } = session.user
  const sp = await searchParams
  const now = new Date()
  const currentWeek = getISOWeek(now)
  const currentYear = now.getFullYear()

  const selectedWeek = parseInt(sp.week ?? String(currentWeek))
  const selectedYear = parseInt(sp.year ?? String(currentYear))

  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) redirect("/login")

  if (role === "EMPLOYEE") {
    const employee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      include: { grade: true },
    })
    if (!employee) redirect("/login")

    const { start: weekStart } = getWeekRangeByWeek(selectedWeek, selectedYear)
    const { start: monthStart, end: monthEnd } = getMonthRange()

    const [weekOrdersWithLines, monthOrders] = await Promise.all([
      prisma.order.findMany({ where: { employeeId: employee.id, status: "CONFIRMED", weekNumber: selectedWeek, year: selectedYear }, include: { lines: true } }),
      prisma.order.findMany({ where: { employeeId: employee.id, status: "CONFIRMED", createdAt: { gte: monthStart, lte: monthEnd } }, include: { lines: true } }),
    ])

    const weekRevenue = weekOrdersWithLines.reduce((s, o) => s + o.total, 0)
    const weekCost = weekOrdersWithLines.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
    const weekSalary = (weekRevenue - weekCost) * (employee.grade.salaryPercent / 100)
    const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0)
    const monthCost = monthOrders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
    const monthSalary = (monthRevenue - monthCost) * (employee.grade.salaryPercent / 100)

    // Daily chart data for selected week
    const dailyData = DAYS.map((label, i) => {
      const dayStart = new Date(weekStart); dayStart.setDate(weekStart.getDate() + i); dayStart.setHours(0,0,0,0)
      const dayEnd = new Date(dayStart); dayEnd.setHours(23,59,59,999)
      const value = weekOrdersWithLines.filter(o => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd).reduce((s, o) => s + o.total, 0)
      return { label, value }
    })

    return (
      <EmployeeDashboard
        employee={{ ...employee, grade: employee.grade }}
        weekRevenue={weekRevenue}
        monthRevenue={monthRevenue}
        weekSalary={weekSalary}
        monthSalary={monthSalary}
        currency={company.currency}
        weekOrderCount={weekOrdersWithLines.length}
        monthOrderCount={monthOrders.length}
        dailyData={dailyData}
        selectedWeek={selectedWeek}
        selectedYear={selectedYear}
        currentWeek={currentWeek}
        currentYear={currentYear}
      />
    )
  }

  // Owner dashboard
  const { start: weekStart } = getWeekRangeByWeek(selectedWeek, selectedYear)

  const prevWeek = selectedWeek === 1 ? getISOWeeksInYear(selectedYear - 1) : selectedWeek - 1
  const prevWeekYear = selectedWeek === 1 ? selectedYear - 1 : selectedYear

  const weeks8 = getPrevWeeks(selectedWeek, selectedYear, 8)
  const { start: monthStart, end: monthEnd } = getMonthRange()

  const [weekOrders, prevWeekOrders, totalEmployees, pendingInvoices, recentOrders, payrolls, trend8orders, monthLines] = await Promise.all([
    prisma.order.findMany({ where: { companyId, status: "CONFIRMED", weekNumber: selectedWeek, year: selectedYear } }),
    prisma.order.findMany({ where: { companyId, status: "CONFIRMED", weekNumber: prevWeek, year: prevWeekYear } }),
    prisma.employee.count({ where: { companyId, isActive: true } }),
    prisma.invoice.count({ where: { companyId, status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.order.findMany({
      where: { companyId },
      include: { employee: true, lines: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.payroll.findMany({ where: { companyId, year: selectedYear, weekNumber: selectedWeek } }),
    prisma.order.findMany({
      where: { companyId, status: "CONFIRMED", OR: weeks8.map(w => ({ weekNumber: w.week, year: w.year })) },
      select: { weekNumber: true, year: true, total: true },
    }),
    prisma.orderLine.findMany({
      where: { order: { companyId, status: "CONFIRMED", createdAt: { gte: monthStart, lte: monthEnd } } },
      select: { quantity: true, menuItem: { select: { name: true } } },
    }),
  ])

  const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0)
  const totalPayroll = payrolls.reduce((s, p) => s + p.netSalary, 0)
  const totalCharges = totalPayroll + payrolls.reduce((s, p) => s + p.taxes, 0)

  // Daily chart data (UTC-based day bucketing)
  const dailyData = DAYS.map((label, i) => {
    const dayStart = new Date(weekStart); dayStart.setDate(weekStart.getDate() + i); dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(dayStart); dayEnd.setHours(23,59,59,999)
    const value = weekOrders.filter(o => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd).reduce((s, o) => s + o.total, 0)
    return { label, value }
  })

  // 8-week trend
  const weeklyTrend = weeks8.map(w => ({
    label: `S${String(w.week).padStart(2, "0")}`,
    value: trend8orders.filter(o => o.weekNumber === w.week && o.year === w.year).reduce((s, o) => s + o.total, 0),
  }))

  // Top items this month
  const itemMap = new Map<string, number>()
  for (const line of monthLines) {
    const name = line.menuItem.name
    itemMap.set(name, (itemMap.get(name) ?? 0) + line.quantity)
  }
  const topItems = [...itemMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }))

  return (
    <OwnerDashboard
      weekRevenue={weekRevenue}
      totalCharges={totalCharges}
      benefit={weekRevenue - totalCharges}
      totalEmployees={totalEmployees}
      pendingInvoices={pendingInvoices}
      weekOrderCount={weekOrders.length}
      prevWeekOrderCount={prevWeekOrders.length}
      recentOrders={recentOrders as any}
      currency={company.currency}
      dailyData={dailyData}
      weeklyTrend={weeklyTrend}
      topItems={topItems}
      selectedWeek={selectedWeek}
      selectedYear={selectedYear}
      currentWeek={currentWeek}
      currentYear={currentYear}
    />
  )
}
