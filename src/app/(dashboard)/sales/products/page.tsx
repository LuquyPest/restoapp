import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProductSalesClient from "@/components/sales/ProductSalesClient"
import { getWeekRange } from "@/lib/utils"

export default async function ProductSalesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  if (role === "EMPLOYEE") redirect("/dashboard")

  const { start, end } = getWeekRange()
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })

  const orderLines = await prisma.orderLine.findMany({
    where: { order: { restaurantId, status: "CONFIRMED", createdAt: { gte: start, lte: end } } },
    include: { menuItem: true },
  })

  const productMap = new Map<string, { name: string; category: string; qty: number; revenue: number; cost: number; margin: number }>()
  for (const line of orderLines) {
    const existing = productMap.get(line.menuItemId) ?? { name: line.menuItem.name, category: line.menuItem.category, qty: 0, revenue: 0, cost: 0, margin: 0 }
    existing.qty += line.quantity
    existing.revenue += line.unitPrice * line.quantity
    existing.cost += line.costPrice * line.quantity
    productMap.set(line.menuItemId, existing)
  }

  const products = Array.from(productMap.values())
    .map(p => ({ ...p, margin: p.revenue - p.cost }))
    .sort((a, b) => b.revenue - a.revenue)

  return <ProductSalesClient products={products} currency={restaurant?.currency ?? "$"} />
}
