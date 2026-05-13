import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import LoyaltyClient from "@/components/loyalty/LoyaltyClient"

export default async function LoyaltyPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  await requirePageAccess(session, "loyalty", ["OWNER", "MANAGER"])
  const cards = await prisma.loyaltyCard.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
  })
  return <LoyaltyClient cards={cards as any} />
}
