import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requirePageAccess } from "@/lib/page-access"
import StockHistoryClient from "@/components/stock/StockHistoryClient"

export default async function StockHistoryPage() {
  const session = await auth()
  if (!session) redirect("/login")
  await requirePageAccess(session, "stock", ["OWNER"])

  const { companyId } = session.user

  const orders = await prisma.order.findMany({
    where: { companyId, status: "CONFIRMED" },
    include: {
      lines: { include: { menuItem: true } },
      employee: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const menuItemIds = [...new Set(orders.flatMap(o => o.lines.map(l => l.menuItemId)))]
  const recipeLines = menuItemIds.length > 0
    ? await prisma.recipeLine.findMany({
        where: { menuItemId: { in: menuItemIds } },
        include: { ingredient: true },
      })
    : []

  const recipeMap = new Map<string, typeof recipeLines>()
  for (const rl of recipeLines) {
    if (!recipeMap.has(rl.menuItemId)) recipeMap.set(rl.menuItemId, [])
    recipeMap.get(rl.menuItemId)!.push(rl)
  }

  const history = orders
    .map(order => {
      const deductionMap = new Map<string, { name: string; quantity: number }>()
      for (const line of order.lines) {
        for (const recipe of recipeMap.get(line.menuItemId) ?? []) {
          const qty = line.quantity * recipe.quantity
          const ex = deductionMap.get(recipe.ingredientId)
          if (ex) ex.quantity += qty
          else deductionMap.set(recipe.ingredientId, { name: recipe.ingredient.name, quantity: qty })
        }
      }
      return {
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        employeeName: order.employee
          ? `${order.employee.firstName} ${order.employee.lastName}`.trim()
          : "—",
        total: order.total,
        weekNumber: order.weekNumber,
        year: order.year,
        items: order.lines.map(l => ({ name: l.menuItem.name, quantity: l.quantity })),
        deductions: Array.from(deductionMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      }
    })
    .filter(o => o.deductions.length > 0)

  return <StockHistoryClient history={history} />
}
