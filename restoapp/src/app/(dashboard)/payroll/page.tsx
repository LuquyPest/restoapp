import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PayrollClient from "@/components/payroll/PayrollClient"

export default async function PayrollPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { restaurantId, role } = session.user
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })

  const where = role === "EMPLOYEE"
    ? { restaurantId, employee: { userId: session.user.id } }
    : { restaurantId }

  const payrolls = await prisma.payroll.findMany({
    where,
    include: { employee: { include: { grade: true } } },
    orderBy: { periodStart: "desc" },
  })

  const employees = role !== "EMPLOYEE"
    ? await prisma.employee.findMany({
        where: { restaurantId, isActive: true },
        include: { grade: true },
        orderBy: { firstName: "asc" },
      })
    : []

  return (
    <PayrollClient
      payrolls={payrolls as any}
      employees={employees as any}
      role={role}
      currency={restaurant?.currency ?? "$"}
      defaultTaxRate={restaurant?.taxRate ?? 0}
    />
  )
}
