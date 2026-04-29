import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import OrdersClient from "@/components/orders/OrdersClient"

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) redirect("/login")

  const [menuItems, partners, employee] = await Promise.all([
    prisma.menuItem.findMany({ where: { restaurantId, isAvailable: true }, orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.partner.findMany({ where: { restaurantId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.employee.findFirst({ where: { userId: session.user.id } }),
  ])

  const ordersWhere = role === "EMPLOYEE" && employee ? { employeeId: employee.id } : { restaurantId }
  const orders = await prisma.order.findMany({
    where: ordersWhere,
    include: { employee: true, lines: { include: { menuItem: true } }, partner: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <OrdersClient
      menuItems={menuItems}
      orders={orders as any}
      partners={partners}
      role={role}
      currency={restaurant.currency}
    />
  )
}
