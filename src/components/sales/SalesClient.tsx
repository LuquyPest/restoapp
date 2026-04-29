"use client"

import { formatCurrency } from "@/lib/utils"
import { TrendingUp, ShoppingCart, Banknote, Award } from "lucide-react"

interface EmployeeStat {
  id: string; firstName: string; lastName: string
  gradeName: string; salaryPercent: number
  revenue: number; costRevenue: number; netRevenue: number; salary: number; orderCount: number
}

interface Props { stats: EmployeeStat[]; currency: string }

export default function SalesClient({ stats, currency }: Props) {
  const fmt = (n: number) => formatCurrency(n, currency)
  const totalRevenue = stats.reduce((s, e) => s + e.revenue, 0)
  const totalCost = stats.reduce((s, e) => s + e.costRevenue, 0)
  const totalSalaries = stats.reduce((s, e) => s + e.salary, 0)

  return (
    <div className="animate-up">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Liste des ventes</h1>
        <p className="page-sub">Performance de l'équipe cette semaine</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "CA total semaine", value: fmt(totalRevenue), icon: TrendingUp, color: "var(--accent)" },
          { label: "Coût de revient", value: fmt(totalCost), icon: ShoppingCart, color: "var(--amber)" },
          { label: "Salaires estimés", value: fmt(totalSalaries), icon: Banknote, color: "var(--green)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employé</th>
              <th>Grade</th>
              <th>Commandes</th>
              <th>CA brut</th>
              <th>Coût revient</th>
              <th>CA net</th>
              <th>% Salaire</th>
              <th>Salaire estimé</th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucune vente cette semaine</td></tr>
            ) : stats.map(emp => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</td>
                <td><span className="badge badge-accent"><Award size={9} /> {emp.gradeName}</span></td>
                <td style={{ color: "var(--text-muted)" }}>{emp.orderCount}</td>
                <td style={{ fontWeight: 600 }}>{fmt(emp.revenue)}</td>
                <td style={{ color: "var(--amber)" }}>−{fmt(emp.costRevenue)}</td>
                <td style={{ fontWeight: 700, color: "var(--accent)" }}>{fmt(emp.netRevenue)}</td>
                <td><span className="badge badge-muted">{emp.salaryPercent}%</span></td>
                <td style={{ fontWeight: 700, color: "var(--green)" }}>{fmt(emp.salary)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
