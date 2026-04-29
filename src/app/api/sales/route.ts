import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { restaurantId } = session.user
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay() + 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  const employees = await prisma.employee.findMany({
    where: { restaurantId, isActive: true },
    include: { grade: true },
  })

  const result = await Promise.all(employees.map(async emp => {
    const orders = await prisma.order.findMany({
      where: { employeeId: emp.id, status: "CONFIRMED", createdAt: { gte: start, lte: end } },
      include: { lines: true },
    })
    const revenue = orders.reduce((s, o) => s + o.total, 0)
    const costRevenue = orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.costPrice * l.quantity, 0), 0)
    const salary = (revenue - costRevenue) * (emp.grade.salaryPercent / 100)
    return {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      grade: emp.grade.name,
      salaryPercent: emp.grade.salaryPercent,
      revenue,
      costRevenue,
      salary,
      orderCount: orders.length,
    }
  }))

  return NextResponse.json(result)
}
