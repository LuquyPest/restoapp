import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getWeekRange, getMonthRange } from "@/lib/utils"
import OwnerDashboard from "@/components/dashboard/OwnerDashboard"
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard"

function getISOWeek(d: Date) {
  const date = new Date(d); date.setHours(0,0,0,0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

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

  const { restaurantId, role } = session.user
  const sp = await searchParams
  const now = new Date()
  const currentWeek = getISOWeek(now)
  const currentYear = now.getFullYear()

  const selectedWeek = parseInt(sp.week ?? String(currentWeek))
  const selectedYear = parseInt(sp.year ?? String(currentYear))

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) redirect("/login")

  if (role === "EMPLOYEE") {
    const employee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      include: { grade: true },
    })
    if (!employee) redirect("/login")

    const { start: weekStart, end: weekEnd } = getWeekRangeByWeek(selectedWeek, selectedYear)
    const { start: monthStart, end: monthEnd } = getMonthRange()

    const [weekOrdersWithLines, monthOrders] = await Promise.all([
      prisma.order.findMany({ where: { employeeId: employee.id, status: "CONFIRMED", createdAt: { gte: weekStart, lte: weekEnd } }, include: { lines: true } }),
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
        currency={restaurant.currency}
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
  const { start: weekStart, end: weekEnd } = getWeekRangeByWeek(selectedWeek, selectedYear)

  const prevWeek = selectedWeek === 1 ? 52 : selectedWeek - 1
  const prevWeekYear = selectedWeek === 1 ? selectedYear - 1 : selectedYear
  const { start: prevWeekStart, end: prevWeekEnd } = getWeekRangeByWeek(prevWeek, prevWeekYear)

  const [weekOrders, prevWeekOrders, totalEmployees, pendingInvoices, recentOrders, payrolls] = await Promise.all([
    prisma.order.findMany({ where: { restaurantId, status: "CONFIRMED", createdAt: { gte: weekStart, lte: weekEnd } } }),
    prisma.order.findMany({ where: { restaurantId, status: "CONFIRMED", createdAt: { gte: prevWeekStart, lte: prevWeekEnd } } }),
    prisma.employee.count({ where: { restaurantId, isActive: true } }),
    prisma.invoice.count({ where: { restaurantId, status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.order.findMany({
      where: { restaurantId },
      include: { employee: true, lines: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.payroll.findMany({ where: { restaurantId, year: selectedYear, weekNumber: selectedWeek } }),
  ])

  const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0)
  const totalPayroll = payrolls.reduce((s, p) => s + p.netSalary, 0)
  const totalCharges = totalPayroll + payrolls.reduce((s, p) => s + p.taxes, 0)

  // Daily chart data
  const dailyData = DAYS.map((label, i) => {
    const dayStart = new Date(weekStart); dayStart.setDate(weekStart.getDate() + i); dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(dayStart); dayEnd.setHours(23,59,59,999)
    const value = weekOrders.filter(o => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd).reduce((s, o) => s + o.total, 0)
    return { label, value }
  })

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
      currency={restaurant.currency}
      dailyData={dailyData}
      selectedWeek={selectedWeek}
      selectedYear={selectedYear}
      currentWeek={currentWeek}
      currentYear={currentYear}
    />
  )
}
