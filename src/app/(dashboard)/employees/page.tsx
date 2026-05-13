import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import EmployeesClient from "@/components/employees/EmployeesClient"

export default async function EmployeesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { restaurantId, role } = session.user
  await requirePageAccess(session, "employees", ["OWNER", "MANAGER"])

  const [employees, grades, restaurant] = await Promise.all([
    prisma.employee.findMany({
      where: { restaurantId },
      include: { grade: true, user: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.grade.findMany({ where: { restaurantId }, orderBy: { name: "asc" } }),
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
  ])

  return (
    <EmployeesClient
      employees={employees}
      grades={grades}
      currency={restaurant?.currency ?? "$"}
      restaurantId={restaurantId}
    />
  )
}
