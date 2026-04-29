import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import MenuClient from "@/components/menu/MenuClient"

export default async function MenuPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { restaurantId, role } = session.user
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })

  const items = await prisma.menuItem.findMany({
    where: { restaurantId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })

  return <MenuClient items={items} role={role} currency={restaurant?.currency ?? "$"} />
}
