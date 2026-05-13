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
  const accessRoles = await prisma.accessRole.findMany({
    where: { restaurantId },
    include: { permissions: true, users: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "asc" },
  })
  const restaurantUsers = await prisma.user.findMany({
    where: { restaurantId, role: { not: "OWNER" } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })
  return <SettingsClient restaurant={restaurant as any} accessRoles={accessRoles as any} restaurantUsers={restaurantUsers as any} webhookUrl={(restaurant as any).webhookUrl ?? ""} />
}
