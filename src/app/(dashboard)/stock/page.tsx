import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import StockClient from "@/components/stock/StockClient"

export default async function StockPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role !== "OWNER") redirect("/dashboard")

  const ingredients = await prisma.ingredient.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { name: "asc" },
  })

  return <StockClient ingredients={ingredients} />
}
