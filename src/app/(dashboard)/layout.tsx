import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Sidebar from "@/components/layout/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { restaurant: true } })
  if (!user?.restaurant) redirect("/login")

  let gradePermissions: string[] | null = null
  if (user.role !== "OWNER") {
    const employee = await prisma.employee.findFirst({
      where: { userId: user.id },
      include: { grade: { include: { permissions: true } } },
    })
    if (employee?.grade?.permissions && employee.grade.permissions.length > 0) {
      gradePermissions = employee.grade.permissions.map(p => p.page)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={user.role} restaurantName={user.restaurant.name} userName={user.name ?? user.email} restaurantLogo={user.restaurant.logo ?? null} gradePermissions={gradePermissions} />
      <div className="ml-60 min-h-screen">
        <main className="p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  )
}
