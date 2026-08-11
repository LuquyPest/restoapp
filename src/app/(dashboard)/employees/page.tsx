import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import EmployeesClient from "@/components/employees/EmployeesClient"

export default async function EmployeesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { companyId, role } = session.user
  await requirePageAccess(session, "employees", ["OWNER", "MANAGER"])

  const [employees, grades, company] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId },
      include: { grade: true, user: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.grade.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
    prisma.company.findUnique({ where: { id: companyId } }),
  ])

  return (
    <EmployeesClient
      employees={employees}
      grades={grades}
      currency={company?.currency ?? "$"}
      companyId={companyId}
    />
  )
}
