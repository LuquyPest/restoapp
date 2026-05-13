import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import SalesClient from "@/components/sales/SalesClient"

function getISOWeek(d: Date) {
  const date = new Date(d); date.setHours(0,0,0,0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ week?: string; year?: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  await requirePageAccess(session, "sales", ["OWNER", "MANAGER"])

  const sp = await searchParams
  const now = new Date()
  const week = parseInt(sp.week ?? String(getISOWeek(now)))
  const year = parseInt(sp.year ?? String(now.getFullYear()))

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  const employees = await prisma.employee.findMany({
    where: { restaurantId, isActive: true },
    include: { grade: true },
  })

  const weekOrders = await prisma.order.findMany({
    where: { restaurantId, status: "CONFIRMED", weekNumber: week, year },
    include: { lines: true, employee: true },
  })

  const employeeStats = employees.map(emp => {
    const empOrders = weekOrders.filter(o => o.employeeId === emp.id)
    const revenue = empOrders.reduce((s, o) => s + o.total, 0)
    const costRevenue = empOrders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
    const netRevenue = revenue - costRevenue
    const salary = revenue * (emp.grade.salaryPercent / 100)
    return {
      id: emp.id, firstName: emp.firstName, lastName: emp.lastName,
      gradeName: emp.grade.name, salaryPercent: emp.grade.salaryPercent,
      revenue, costRevenue, netRevenue, salary, orderCount: empOrders.length,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  return (
    <SalesClient
      stats={employeeStats}
      currency={restaurant?.currency ?? "$"}
      selectedWeek={week}
      selectedYear={year}
      currentWeek={getISOWeek(now)}
      currentYear={now.getFullYear()}
    />
  )
}
