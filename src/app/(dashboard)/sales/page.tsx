import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import SalesClient from "@/components/sales/SalesClient"
import { getISOWeek } from "@/lib/utils"

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ week?: string; year?: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")
  const { companyId, role } = session.user
  await requirePageAccess(session, "sales", ["OWNER", "MANAGER"])

  const sp = await searchParams
  const now = new Date()
  const week = parseInt(sp.week ?? String(getISOWeek(now)))
  const year = parseInt(sp.year ?? String(now.getFullYear()))

  const company = await prisma.company.findUnique({ where: { id: companyId } })
  const employees = await prisma.employee.findMany({
    where: { companyId, isActive: true },
    include: { grade: true },
  })

  const weekOrders = await prisma.order.findMany({
    where: { companyId, status: "CONFIRMED", weekNumber: week, year },
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
      currency={company?.currency ?? "$"}
      selectedWeek={week}
      selectedYear={year}
      currentWeek={getISOWeek(now)}
      currentYear={now.getFullYear()}
    />
  )
}
