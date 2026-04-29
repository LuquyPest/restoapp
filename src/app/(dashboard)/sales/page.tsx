import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SalesClient from "@/components/sales/SalesClient"
import { getWeekRange } from "@/lib/utils"

export default async function SalesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  if (role === "EMPLOYEE") redirect("/dashboard")

  const { start, end } = getWeekRange()
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })

  const employees = await prisma.employee.findMany({
    where: { restaurantId, isActive: true },
    include: { grade: true },
  })

  const weekOrders = await prisma.order.findMany({
    where: { restaurantId, status: "CONFIRMED", createdAt: { gte: start, lte: end } },
    include: { lines: true, employee: true },
  })

  const employeeStats = employees.map(emp => {
    const empOrders = weekOrders.filter(o => o.employeeId === emp.id)
    const revenue = empOrders.reduce((s, o) => s + o.total, 0)
    const costRevenue = empOrders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
    const netRevenue = revenue - costRevenue
    const salary = netRevenue * (emp.grade.salaryPercent / 100)
    return {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      gradeName: emp.grade.name,
      salaryPercent: emp.grade.salaryPercent,
      revenue,
      costRevenue,
      netRevenue,
      salary,
      orderCount: empOrders.length,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  return <SalesClient stats={employeeStats} currency={restaurant?.currency ?? "$"} />
}
