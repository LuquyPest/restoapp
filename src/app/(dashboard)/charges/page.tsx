import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import ChargesClient from "@/components/charges/ChargesClient"

export default async function ChargesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { companyId, role } = session.user
  await requirePageAccess(session, "charges", ["OWNER", "MANAGER"])
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  return <ChargesClient currency={company?.currency ?? "$"} />
}
