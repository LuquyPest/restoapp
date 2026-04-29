"use client"

import { formatCurrency } from "@/lib/utils"
import { Package } from "lucide-react"

interface Product { name: string; category: string; qty: number; revenue: number; cost: number; margin: number }
interface Props { products: Product[]; currency: string }

export default function ProductSalesClient({ products, currency }: Props) {
  const fmt = (n: number) => formatCurrency(n, currency)
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0)
  const totalQty = products.reduce((s, p) => s + p.qty, 0)

  return (
    <div className="animate-up">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Ventes par produit</h1>
        <p className="page-sub">{totalQty} articles vendus · {fmt(totalRevenue)} de CA cette semaine</p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Qté vendue</th>
              <th>CA généré</th>
              <th>Coût revient</th>
              <th>Marge</th>
              <th>% du CA total</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucune vente cette semaine</td></tr>
            ) : products.map((p, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Package size={13} style={{ color: "var(--accent)" }} />
                    </div>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                  </div>
                </td>
                <td><span className="badge badge-muted">{p.category}</span></td>
                <td style={{ fontWeight: 700 }}>{p.qty}</td>
                <td style={{ fontWeight: 700 }}>{fmt(p.revenue)}</td>
                <td style={{ color: "var(--amber)" }}>−{fmt(p.cost)}</td>
                <td style={{ fontWeight: 700, color: p.margin >= 0 ? "var(--green)" : "var(--red)" }}>{fmt(p.margin)}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: "var(--bg-hover)", borderRadius: 2, overflow: "hidden", maxWidth: 80 }}>
                      <div style={{ height: "100%", background: "var(--accent)", borderRadius: 2, width: `${totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0}%` }} />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 36 }}>
                      {totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
