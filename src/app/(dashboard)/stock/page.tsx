import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import StockClient from "@/components/stock/StockClient"
import { requirePageAccess } from "@/lib/page-access"

export default async function StockPage() {
  const session = await auth()
  if (!session) redirect("/login")
  await requirePageAccess(session, "stock", ["OWNER"])

  const ingredients = await prisma.ingredient.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { name: "asc" },
  })

  return <StockClient ingredients={ingredients} />
}
