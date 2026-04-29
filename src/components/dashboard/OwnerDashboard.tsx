"use client"

import { formatCurrency, formatDateTime } from "@/lib/utils"
import { TrendingUp, Users, ShoppingCart, FileText, Banknote, CheckCircle, Clock, AlertCircle, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface RecentOrder {
  id: string; total: number; status: string; createdAt: Date
  employee: { firstName: string; lastName: string } | null
  lines: { quantity: number; menuItem: { name: string } }[]
}

interface Props {
  weekRevenue: number; monthRevenue: number; totalCharges: number; benefit: number
  totalEmployees: number; pendingInvoices: number; weekOrderCount: number; monthOrderCount: number
  recentOrders: RecentOrder[]; currency: string
}

export default function OwnerDashboard({ weekRevenue, monthRevenue, totalCharges, benefit, totalEmployees, pendingInvoices, weekOrderCount, monthOrderCount, recentOrders, currency }: Props) {
  const fmt = (n: number) => formatCurrency(n, currency)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-sub">Vue d'ensemble de votre établissement</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "CA ce mois", value: fmt(monthRevenue), sub: `Semaine : ${fmt(weekRevenue)}`, icon: TrendingUp, color: "var(--accent)" },
          { label: "Charges", value: fmt(totalCharges), sub: "Payes + taxes", icon: Banknote, color: "var(--amber)" },
          { label: "Bénéfice", value: fmt(benefit), sub: "CA − charges", icon: TrendingUp, color: benefit >= 0 ? "var(--green)" : "var(--red)" },
          { label: "Commandes", value: String(monthOrderCount), sub: `Semaine : ${weekOrderCount}`, icon: ShoppingCart, color: "var(--accent)" },
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

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <Link href="/employees" style={{
          textDecoration: "none", display: "flex", alignItems: "center", gap: 16,
          padding: "16px 20px", borderRadius: 12, background: "var(--bg-card)",
          border: "1px solid var(--border)", transition: "border-color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-mid)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{totalEmployees}</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Employés actifs</p>
          </div>
          <ArrowUpRight size={16} style={{ color: "var(--text-subtle)" }} />
        </Link>

        <Link href="/invoices" style={{
          textDecoration: "none", display: "flex", alignItems: "center", gap: 16,
          padding: "16px 20px", borderRadius: 12, background: "var(--bg-card)",
          border: "1px solid var(--border)", transition: "border-color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-mid)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: pendingInvoices > 0 ? "var(--amber-dim)" : "var(--green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={18} style={{ color: pendingInvoices > 0 ? "var(--amber)" : "var(--green)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{pendingInvoices}</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Factures en attente</p>
          </div>
          <ArrowUpRight size={16} style={{ color: "var(--text-subtle)" }} />
        </Link>
      </div>

      {/* Recent orders */}
      <div className="table-wrap">
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Dernières commandes</span>
          <Link href="/orders" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Voir tout →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Aucune commande</div>
        ) : (
          <div>
            {recentOrders.map(order => (
              <div key={order.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: order.status === "CONFIRMED" ? "var(--green-dim)" : order.status === "CANCELLED" ? "var(--red-dim)" : "var(--amber-dim)" }}>
                  {order.status === "CONFIRMED" ? <CheckCircle size={13} style={{ color: "var(--green)" }} /> :
                   order.status === "CANCELLED" ? <AlertCircle size={13} style={{ color: "var(--red)" }} /> :
                   <Clock size={13} style={{ color: "var(--amber)" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    {order.employee ? `${order.employee.firstName} ${order.employee.lastName}` : "—"}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.lines.map(l => `${l.quantity}× ${l.menuItem.name}`).join(", ")}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{fmt(order.total)}</p>
                  <p style={{ fontSize: 11, color: "var(--text-subtle)" }}>{formatDateTime(order.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
