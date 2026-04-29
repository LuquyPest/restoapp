import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Sidebar from "@/components/layout/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { restaurant: true },
  })
  if (!user?.restaurant) redirect("/login")

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar
        userRole={user.role}
        restaurantName={user.restaurant.name}
        userName={user.name ?? user.email}
      />
      <div style={{ marginLeft: "var(--sidebar-w)", minHeight: "100vh" }}>
        <main style={{ padding: "32px 32px", maxWidth: 1200 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
