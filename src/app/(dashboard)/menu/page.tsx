import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import MenuClient from "@/components/menu/MenuClient"

export default async function MenuPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { restaurantId, role } = session.user
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })

  const [items, ingredients] = await Promise.all([
    prisma.menuItem.findMany({
      where: { restaurantId, deletedAt: null },
      include: { recipeLines: { include: { ingredient: true } } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    session.user.role === "OWNER"
      ? prisma.ingredient.findMany({ where: { restaurantId }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ])

  return <MenuClient items={items} role={role} currency={restaurant?.currency ?? "$"} ingredients={ingredients} />
}
