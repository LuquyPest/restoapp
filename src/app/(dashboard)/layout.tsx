import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { checkAndCreateInvoiceNotifications } from "@/lib/notifications"
import DashboardShell from "@/components/layout/DashboardShell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { company: true } })
  if (!user?.company) redirect("/login")

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

  if (user.role === "OWNER" || user.role === "MANAGER") {
    checkAndCreateInvoiceNotifications(user.company.id).catch(() => {})
  }

  const notifications = await prisma.notification.findMany({
    where: { companyId: user.company.id, isRead: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <DashboardShell
      userRole={user.role}
      companyName={user.company.name}
      companyType={user.company.type}
      userName={user.name ?? user.email}
      companyLogo={user.company.logo ?? null}
      gradePermissions={pagePermissions}
      accessRoleName={accessRoleName}
      initialNotifications={notifications.map(n => ({ ...n, createdAt: n.createdAt.toISOString() }))}
    >
      {children}
    </DashboardShell>
  )
}
