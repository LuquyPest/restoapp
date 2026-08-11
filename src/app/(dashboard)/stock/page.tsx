import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import StockClient from "@/components/stock/StockClient"
import { requirePageAccess } from "@/lib/page-access"

export default async function StockPage() {
  const session = await auth()
  if (!session) redirect("/login")
  await requirePageAccess(session, "stock", ["OWNER"])

  const [ingredients, company] = await Promise.all([
    prisma.ingredient.findMany({
      where: { companyId: session.user.companyId },
      orderBy: { name: "asc" },
    }),
    prisma.company.findUnique({ where: { id: session.user.companyId } }),
  ])

  return <StockClient ingredients={ingredients} companyType={company?.type ?? "RESTO_BAR"} />
}
