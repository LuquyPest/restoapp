import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PartnersClient from "@/components/partners/PartnersClient"

export default async function PartnersPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  if (role === "EMPLOYEE") redirect("/dashboard")
  const partners = await prisma.partner.findMany({ where: { restaurantId }, orderBy: { name: "asc" } })
  return <PartnersClient partners={partners} />
}
