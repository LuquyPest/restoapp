import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SettingsClient from "@/components/settings/SettingsClient"

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  if (role !== "OWNER") redirect("/dashboard")
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) redirect("/login")
  return <SettingsClient restaurant={restaurant as any} />
}
