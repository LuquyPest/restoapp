import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import RestaurantLogsClient from "@/components/admin/RestaurantLogsClient"

export default async function RestaurantLogsPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const ok = await getAdminSession()
  if (!ok) redirect("/admin/login")

  const { restaurantId } = await params
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, name: true },
  })
  if (!restaurant) redirect("/admin")

  return <RestaurantLogsClient restaurantId={restaurant.id} restaurantName={restaurant.name} />
}
