import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Sidebar from "@/components/layout/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { restaurant: true } })
  if (!user?.restaurant) redirect("/login")

  let pagePermissions: string[] | null = null
  let accessRoleName: string | null = null
  if (user.role !== "OWNER") {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { accessRole: { include: { permissions: true } } },
    })
    if (fullUser?.accessRole) {
      accessRoleName = fullUser.accessRole.name
      if (fullUser.accessRole.permissions.length > 0) {
        pagePermissions = fullUser.accessRole.permissions.map(p => p.page)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={user.role} restaurantName={user.restaurant.name} userName={user.name ?? user.email} restaurantLogo={user.restaurant.logo ?? null} gradePermissions={pagePermissions} accessRoleName={accessRoleName} />
      <div className="ml-60 min-h-screen">
        <main className="p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  )
}
