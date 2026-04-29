import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { restaurant: true },
  })

  if (!user?.restaurant) redirect("/login")

  const titles: Record<string, string> = {
    dashboard: "Tableau de bord",
    employees: "Employés",
    menu: "Carte",
    orders: "Commandes",
    suppliers: "Fournisseurs",
    invoices: "Factures",
    payroll: "Payes",
    settings: "Paramètres",
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar
        userRole={user.role}
        restaurantName={user.restaurant.name}
        userName={user.name ?? user.email}
      />
      <div className="ml-60 flex flex-col min-h-screen">
        <main className="flex-1 p-6 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  )
}
