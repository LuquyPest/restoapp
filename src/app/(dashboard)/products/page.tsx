import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"

export default async function ProductsPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  if (role === "EMPLOYEE") redirect("/dashboard")

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  const fmt = (n: number) => formatCurrency(n, restaurant?.currency ?? "$")

  const now = new Date()
  const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1); start.setHours(0,0,0,0)
  const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999)

  const lines = await prisma.orderLine.findMany({
    where: { order: { restaurantId, status: "CONFIRMED", createdAt: { gte: start, lte: end } } },
    include: { menuItem: true },
  })

  const productMap: Record<string, { name: string; category: string; quantity: number; revenue: number; cost: number }> = {}
  for (const line of lines) {
    const id = line.menuItemId
    if (!productMap[id]) productMap[id] = { name: line.menuItem.name, category: line.menuItem.category, quantity: 0, revenue: 0, cost: 0 }
    productMap[id].quantity += line.quantity
    productMap[id].revenue += line.unitPrice * line.quantity
    productMap[id].cost += line.costPrice * line.quantity
  }

  const products = Object.values(productMap).sort((a, b) => b.revenue - a.revenue)
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Ventes par produit</h1>
        <p className="page-sub">Classement des articles cette semaine</p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Article</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th>CA généré</th>
              <th>Coût revient</th>
              <th>Marge</th>
              <th>% du CA total</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucune vente cette semaine</td></tr>
            ) : products.map((p, i) => {
              const margin = p.revenue - p.cost
              const pct = totalRevenue > 0 ? (p.revenue / totalRevenue * 100).toFixed(1) : "0"
              return (
                <tr key={p.name}>
                  <td style={{ color: "var(--text-subtle)", fontWeight: 600 }}>#{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span className="badge badge-muted">{p.category}</span></td>
                  <td style={{ color: "var(--text-muted)" }}>{p.quantity}</td>
                  <td style={{ fontWeight: 700 }}>{fmt(p.revenue)}</td>
                  <td style={{ color: "var(--red)" }}>−{fmt(p.cost)}</td>
                  <td style={{ color: margin >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{fmt(margin)}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "var(--bg-hover)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 36 }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
