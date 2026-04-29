"use client"

import { formatCurrency } from "@/lib/utils"
import { TrendingUp, ShoppingCart, Banknote, Award } from "lucide-react"
import Link from "next/link"

interface Props {
  employee: { firstName: string; lastName: string; grade: { name: string; salaryPercent: number } }
  weekRevenue: number; monthRevenue: number; weekSalary: number; monthSalary: number
  currency: string; weekOrderCount: number; monthOrderCount: number
}

export default function EmployeeDashboard({ employee, weekRevenue, monthRevenue, weekSalary, monthSalary, currency, weekOrderCount, monthOrderCount }: Props) {
  const fmt = (n: number) => formatCurrency(n, currency)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Bonjour, {employee.firstName}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <span className="badge badge-accent"><Award size={10} /> {employee.grade.name}</span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{employee.grade.salaryPercent}% de commission sur vos ventes</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "CA cette semaine", value: fmt(weekRevenue), sub: `${weekOrderCount} commandes`, icon: TrendingUp, color: "var(--accent)" },
          { label: "Salaire estimé semaine", value: fmt(weekSalary), sub: `${employee.grade.salaryPercent}% du CA`, icon: Banknote, color: "var(--green)" },
          { label: "CA ce mois", value: fmt(monthRevenue), sub: `${monthOrderCount} commandes`, icon: ShoppingCart, color: "var(--accent)" },
          { label: "Salaire estimé mois", value: fmt(monthSalary), sub: `${employee.grade.salaryPercent}% du CA`, icon: Banknote, color: "var(--green)" },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-up" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "var(--text-subtle)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Actions rapides</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Link href="/orders" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ width: "100%", height: 40 }}>Nouvelle commande</button>
          </Link>
          <Link href="/payroll" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ width: "100%", height: 40 }}>Mes payes</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
