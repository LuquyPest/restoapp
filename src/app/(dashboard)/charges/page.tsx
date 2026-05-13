import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ChargesClient from "@/components/charges/ChargesClient"

export default async function ChargesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  if (role === "EMPLOYEE") redirect("/dashboard")
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  return <ChargesClient currency={restaurant?.currency ?? "$"} />
}
