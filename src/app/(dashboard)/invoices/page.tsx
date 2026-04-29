import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import InvoicesClient from "@/components/invoices/InvoicesClient"

export default async function InvoicesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  if (role === "EMPLOYEE") redirect("/dashboard")

  const [invoices, suppliers, restaurant] = await Promise.all([
    prisma.invoice.findMany({
      where: { restaurantId },
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({ where: { restaurantId }, orderBy: { name: "asc" } }),
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
  ])

  const now = new Date()
  const enriched = invoices.map((inv) => ({
    ...inv,
    status: inv.status === "PENDING" && new Date(inv.dueDate) < now ? "OVERDUE" : inv.status,
  }))

  return <InvoicesClient invoices={enriched as any} suppliers={suppliers} currency={restaurant?.currency ?? "$"} />
}
