import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import PartnersClient from "@/components/partners/PartnersClient"

export default async function PartnersPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  await requirePageAccess(session, "partners", ["OWNER", "MANAGER"])
  const partners = await prisma.partner.findMany({ where: { restaurantId }, orderBy: { name: "asc" } })
  return <PartnersClient partners={partners} />
}
