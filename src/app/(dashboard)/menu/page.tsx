import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import MenuClient from "@/components/menu/MenuClient"

export default async function MenuPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { companyId, role } = session.user
  const company = await prisma.company.findUnique({ where: { id: companyId } })

  const [items, ingredients] = await Promise.all([
    prisma.menuItem.findMany({
      where: { companyId, deletedAt: null },
      include: { recipeLines: { include: { ingredient: true } } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    session.user.role === "OWNER"
      ? prisma.ingredient.findMany({ where: { companyId }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ])

  return <MenuClient items={items} role={role} currency={company?.currency ?? "$"} ingredients={ingredients} companyType={company?.type ?? "RESTO_BAR"} />
}
