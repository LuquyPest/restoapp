import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Sidebar from "@/components/layout/Sidebar"
import SearchBar from "@/components/layout/SearchBar"
import { checkAndCreateInvoiceNotifications } from "@/lib/notifications"
import Link from "next/link"
import { NotebookPen } from "lucide-react"

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

  // Check and generate overdue invoice notifications (fire-and-forget, non-blocking)
  if (user.role === "OWNER" || user.role === "MANAGER") {
    checkAndCreateInvoiceNotifications(user.restaurant.id).catch(() => {})
  }

  const notifications = await prisma.notification.findMany({
    where: { restaurantId: user.restaurant.id, isRead: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        userRole={user.role}
        restaurantName={user.restaurant.name}
        userName={user.name ?? user.email}
        restaurantLogo={user.restaurant.logo ?? null}
        gradePermissions={pagePermissions}
        accessRoleName={accessRoleName}
        initialNotifications={notifications}
      />
      <div className="ml-60 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 h-14 flex items-center gap-3">
          <div className="flex-1"><SearchBar /></div>
          <Link href="/patchnotes" className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Notes de mise à jour">
            <NotebookPen className="h-4 w-4" />
          </Link>
        </header>
        <main className="p-8 max-w-7xl flex-1">{children}</main>
      </div>
    </div>
  )
}
