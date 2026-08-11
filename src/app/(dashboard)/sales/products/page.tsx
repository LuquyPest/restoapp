import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import ProductSalesClient from "@/components/sales/ProductSalesClient"
import { getISOWeek } from "@/lib/utils"

export default async function ProductSalesPage({ searchParams }: { searchParams: Promise<{ week?: string; year?: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")
  const { companyId, role } = session.user
  await requirePageAccess(session, "sales/products", ["OWNER", "MANAGER"])

  const sp = await searchParams
  const now = new Date()
  const week = parseInt(sp.week ?? String(getISOWeek(now)))
  const year = parseInt(sp.year ?? String(now.getFullYear()))

  const company = await prisma.company.findUnique({ where: { id: companyId } })

  const orderLines = await prisma.orderLine.findMany({
    where: { order: { companyId, status: "CONFIRMED", weekNumber: week, year } },
    include: { menuItem: true },
  })

  const productMap = new Map<string, { name: string; category: string; qty: number; revenue: number; cost: number }>()
  for (const line of orderLines) {
    const ex = productMap.get(line.menuItemId) ?? { name: line.menuItem.name, category: line.menuItem.category, qty: 0, revenue: 0, cost: 0 }
    ex.qty += line.quantity; ex.revenue += line.unitPrice * line.quantity; ex.cost += line.costPrice * line.quantity
    productMap.set(line.menuItemId, ex)
  }

  const products = Array.from(productMap.values())
    .map(p => ({ ...p, margin: p.revenue - p.cost }))
    .sort((a, b) => b.revenue - a.revenue)

  return (
    <ProductSalesClient
      products={products}
      currency={company?.currency ?? "$"}
      selectedWeek={week}
      selectedYear={year}
      currentWeek={getISOWeek(now)}
      currentYear={now.getFullYear()}
    />
  )
}
