import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import EmployeeDetailClient from "@/components/employees/EmployeeDetailClient"

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")

  const { companyId } = session.user
  await requirePageAccess(session, "employees", ["OWNER", "MANAGER"])

  const { id } = await params

  const [employee, grades] = await Promise.all([
    prisma.employee.findFirst({
      where: { id, companyId },
      include: { grade: true, user: { select: { id: true, email: true } } },
    }),
    prisma.grade.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
  ])
  if (!employee) notFound()

  return <EmployeeDetailClient employee={employee} grades={grades} canManage viewerUserId={session.user.id} />
}
