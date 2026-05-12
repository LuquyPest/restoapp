import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import LoyaltyClient from "@/components/loyalty/LoyaltyClient"

export default async function LoyaltyPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  if (role === "EMPLOYEE") redirect("/dashboard")
  const cards = await prisma.loyaltyCard.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
  })
  return <LoyaltyClient cards={cards as any} />
}
