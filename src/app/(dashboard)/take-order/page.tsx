import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import TakeOrderClient from "@/components/orders/TakeOrderClient"

export default async function TakeOrderPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { companyId } = session.user
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) redirect("/login")
  if (company.type !== "RESTO_BAR") redirect("/dashboard")

  await requirePageAccess(session, "take-order", ["OWNER", "MANAGER", "EMPLOYEE"])

  const now = new Date()
  const [menuItems, partners, loyaltyCards] = await Promise.all([
    prisma.menuItem.findMany({ where: { companyId, isAvailable: true }, orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.partner.findMany({ where: { companyId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.loyaltyCard.findMany({ where: { companyId, isActive: true, expiresAt: { gte: now } }, orderBy: { lastName: "asc" } }),
  ])

  return (
    <TakeOrderClient
      menuItems={menuItems}
      partners={partners}
      loyaltyCards={loyaltyCards as any}
      currency={company.currency}
    />
  )
}
