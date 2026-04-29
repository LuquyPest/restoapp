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

  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId, isAvailable: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
  })

  const ordersQuery =
    role === "EMPLOYEE" && employee
      ? { employeeId: employee.id }
      : { restaurantId }

  const orders = await prisma.order.findMany({
    where: ordersQuery,
    include: {
      employee: true,
      lines: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <OrdersClient
      menuItems={menuItems}
      orders={orders}
      role={role}
      employeeId={employee?.id ?? null}
      currency={restaurant.currency}
    />
  )
}
