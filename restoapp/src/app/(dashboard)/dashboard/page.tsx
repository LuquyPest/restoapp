import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatCurrency, getWeekRange, getMonthRange } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  FileText,
  Banknote,
  AlertTriangle,
} from "lucide-react"
import OwnerDashboard from "@/components/dashboard/OwnerDashboard"
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { restaurantId, role } = session.user
  const { start: weekStart, end: weekEnd } = getWeekRange()
  const { start: monthStart, end: monthEnd } = getMonthRange()

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  })

  if (!restaurant) redirect("/login")

  if (role === "EMPLOYEE") {
    const employee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      include: { grade: true },
    })
    if (!employee) redirect("/login")

    const weekOrders = await prisma.order.findMany({
      where: {
        employeeId: employee.id,
        status: "CONFIRMED",
        createdAt: { gte: weekStart, lte: weekEnd },
      },
    })
    const monthOrders = await prisma.order.findMany({
      where: {
        employeeId: employee.id,
        status: "CONFIRMED",
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    })

    const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0)
    const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0)
    const weekSalary = weekRevenue * (employee.grade.salaryPercent / 100)
    const monthSalary = monthRevenue * (employee.grade.salaryPercent / 100)

    return (
      <EmployeeDashboard
        employee={{ ...employee, grade: employee.grade }}
        weekRevenue={weekRevenue}
        monthRevenue={monthRevenue}
        weekSalary={weekSalary}
        monthSalary={monthSalary}
        currency={restaurant.currency}
        weekOrderCount={weekOrders.length}
        monthOrderCount={monthOrders.length}
      />
    )
  }

  const [
    weekOrders,
    monthOrders,
    totalEmployees,
    pendingInvoices,
    recentOrders,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId, status: "CONFIRMED", createdAt: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.order.findMany({
      where: { restaurantId, status: "CONFIRMED", createdAt: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.employee.count({ where: { restaurantId, isActive: true } }),
    prisma.invoice.count({ where: { restaurantId, status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.order.findMany({
      where: { restaurantId },
      include: { employee: true, lines: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0)
  const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0)
  const weekOrders2 = weekOrders.length
  const monthOrders2 = monthOrders.length

  const payrolls = await prisma.payroll.findMany({
    where: { restaurantId, periodStart: { gte: monthStart }, periodEnd: { lte: monthEnd } },
  })
  const totalPayroll = payrolls.reduce((s, p) => s + p.netSalary, 0)
  const totalTaxes = payrolls.reduce((s, p) => s + p.taxes, 0)
  const totalCharges = totalPayroll + totalTaxes

  return (
    <OwnerDashboard
      weekRevenue={weekRevenue}
      monthRevenue={monthRevenue}
      totalCharges={totalCharges}
      benefit={monthRevenue - totalCharges}
      totalEmployees={totalEmployees}
      pendingInvoices={pendingInvoices}
      weekOrderCount={weekOrders2}
      monthOrderCount={monthOrders2}
      recentOrders={recentOrders}
      currency={restaurant.currency}
    />
  )
}
