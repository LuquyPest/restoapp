import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EmployeeDetailClient from "@/components/employees/EmployeeDetailClient"

export default async function SelfServicePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
    include: { grade: true, user: { select: { id: true, email: true } } },
  })
  if (!employee) redirect("/dashboard")

  return (
    <EmployeeDetailClient
      employee={employee}
      grades={[]}
      canManage={false}
      isOwner={false}
      viewerUserId={session.user.id}
    />
  )
}
