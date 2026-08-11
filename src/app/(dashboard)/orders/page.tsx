import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import OrdersClient from "@/components/orders/OrdersClient"

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { companyId, role } = session.user
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) redirect("/login")

  const now = new Date()

  const [menuItems, partners, loyaltyCards, employee, employees] = await Promise.all([
    prisma.menuItem.findMany({ where: { companyId, isAvailable: true }, orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.partner.findMany({ where: { companyId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.loyaltyCard.findMany({ where: { companyId, isActive: true, expiresAt: { gte: now } }, orderBy: { lastName: "asc" } }),
    prisma.employee.findFirst({ where: { userId: session.user.id } }),
    role !== "EMPLOYEE"
      ? prisma.employee.findMany({ where: { companyId, isActive: true }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } })
      : Promise.resolve([]),
  ])

  const ordersWhere = role === "EMPLOYEE" && employee ? { employeeId: employee.id } : { companyId }
  const orders = await prisma.order.findMany({
    where: ordersWhere,
    include: {
      employee: { select: { id: true, firstName: true, lastName: true } },
      lines: { include: { menuItem: true } },
      partner: true,
      loyaltyCard: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return (
    <OrdersClient
      menuItems={menuItems}
      orders={orders as any}
      partners={partners}
      loyaltyCards={loyaltyCards as any}
      role={role}
      currency={company.currency}
      employees={employees}
    />
  )
}
