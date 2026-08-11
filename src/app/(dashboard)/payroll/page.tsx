import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PayrollClient from "@/components/payroll/PayrollClient"

export default async function PayrollPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { companyId, role } = session.user
  const company = await prisma.company.findUnique({ where: { id: companyId } })

  const where = role === "EMPLOYEE"
    ? { companyId, employee: { userId: session.user.id } }
    : { companyId }

  const payrolls = await prisma.payroll.findMany({
    where,
    include: { employee: { include: { grade: true } } },
    orderBy: { createdAt: "desc" },
  })

  const employees = role !== "EMPLOYEE"
    ? await prisma.employee.findMany({
        where: { companyId, isActive: true },
        include: { grade: true },
        orderBy: { firstName: "asc" },
      })
    : []

  return (
    <PayrollClient
      payrolls={payrolls as any}
      employees={employees as any}
      role={role}
      currency={company?.currency ?? "$"}
      defaultTaxRate={company?.taxRate ?? 0}
    />
  )
}
